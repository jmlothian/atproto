import { BlobStore, BlobNotFoundError } from '@atproto/repo'
import { CID } from 'multiformats/cid'
import stream from 'stream'
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, BlockBlobClient, ContainerClient } from "@azure/storage-blob";
import { randomStr } from '@atproto/crypto'
import { v1 as uuidv1 } from "uuid";

export type AzureBlobStorageConfig = {
    container: string,
    accountName: string
}

export class AzureBlobStore implements BlobStore {

    private client: BlobServiceClient
    private containerClient :ContainerClient
    private container: string

    constructor(cfg: AzureBlobStorageConfig) {
        this.container = cfg.container
        this.client = new BlobServiceClient(
            `https://${cfg.accountName}.blob.core.windows.net`,
            new DefaultAzureCredential()
        );
        this.containerClient = this.client.getContainerClient(this.container);
    }

    private genKey() {
        return randomStr(32, 'base32')
    }
    
    private getTmpPath(key: string): string {
        return `tmp/${key}`
    }
    
    private getStoredPath(cid: CID): string {
        return `blocks/${cid.toString()}`
    }
    
    private getQuarantinedPath(cid: CID): string {
        return `quarantine/${cid.toString()}`
    }

    async putTemp(bytes: any): Promise<string> {
        const key = this.genKey()
        const blockBlobClient: BlockBlobClient = await this.containerClient.getBlockBlobClient(this.getTmpPath(key));
        const uploadResponse = await blockBlobClient.uploadData(bytes);
        return key
    }
    async makePermanent(key: string, cid: CID): Promise<void> {
        const alreadyHas = await this.hasStored(cid)
        if (!alreadyHas) {
          await this.move({
            from: this.getTmpPath(key),
            to: this.getStoredPath(cid),
          })
        } else {
          // already saved, so we no-op & just delete the temp
          await this.deleteKey(this.getTmpPath(key))
        }
    }
    async putPermanent(cid: CID, bytes: any): Promise<void> {
        const key = this.genKey()
        const blockBlobClient: BlockBlobClient = await this.containerClient.getBlockBlobClient(this.getStoredPath(cid));
        const uploadResponse = await blockBlobClient.uploadData(bytes);
    }
    async quarantine(cid: CID): Promise<void> {
        await this.move({
            from: this.getStoredPath(cid),
            to: this.getQuarantinedPath(cid),
          })
    }
    async unquarantine(cid: CID): Promise<void> {
        await this.move({
            from: this.getQuarantinedPath(cid),
            to: this.getStoredPath(cid),
          })
    }
    async getBytes(cid: CID): Promise<Uint8Array> {
        //todo: not found error
        const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(this.getStoredPath(cid));
        const buffer = await blockBlobClient.downloadToBuffer()
        return buffer;
    }

    private async getObject(cid: CID) {
        //todo: not found error
        const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(this.getStoredPath(cid));
        const res = await blockBlobClient.download()
        return res;
      }

    async getStream(cid: CID): Promise<stream.Readable> {
        //todo: not found error
        const res = await this.getObject(cid)
        return res.readableStreamBody as stream.Readable
    }
    async delete(cid: CID): Promise<void> {
        await this.deleteKey(this.getStoredPath(cid))
    }
    async hasStored(cid: CID): Promise<boolean> {
        try {
            const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(this.getStoredPath(cid));
            return await  blockBlobClient.exists();
          } catch (err) {
            return false
          }
    }
    private async deleteKey(key: string) {
        const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(key);
        await blockBlobClient.deleteIfExists();
    }
    private async move(keys: { from: string; to: string }) {
        var sourceBlobClient = this.containerClient.getBlockBlobClient(keys.from)
        var targetBlobClient = this.containerClient.getBlockBlobClient(keys.to)
        await targetBlobClient.beginCopyFromURL(sourceBlobClient.url);
        await sourceBlobClient.deleteIfExists();
      }

}

export default AzureBlobStore