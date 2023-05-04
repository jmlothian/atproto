import { BlobStore, BlobNotFoundError } from '@atproto/repo'
import { CID } from 'multiformats/cid'
import stream from 'stream'
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from "@azure/storage-blob";
import { randomStr } from '@atproto/crypto'
import { v1 as uuidv1 } from "uuid";

export type AzureBlobStorageConfig = {
    container: string,
    accountName: string
}

export class AzureBlobStore implements BlobStore {

    private client: BlobServiceClient
    private container: string
    constructor(cfg: AzureBlobStorageConfig) {
        this.container = cfg.container
        this.client = new BlobServiceClient(
            `https://${cfg.accountName}.blob.core.windows.net`,
            new DefaultAzureCredential()
        );
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

    putTemp(bytes: any): Promise<string> {
        throw new Error('Method not implemented.')
    }
    makePermanent(key: string, cid: CID): Promise<void> {
        throw new Error('Method not implemented.')
    }
    putPermanent(cid: CID, bytes: any): Promise<void> {
        throw new Error('Method not implemented.')
    }
    quarantine(cid: CID): Promise<void> {
        throw new Error('Method not implemented.')
    }
    unquarantine(cid: CID): Promise<void> {
        throw new Error('Method not implemented.')
    }
    getBytes(cid: CID): Promise<Uint8Array> {
        throw new Error('Method not implemented.')
    }

    private async getObject(cid: CID) {
        const res = await this.client.download({
          Bucket: this.container,
          Key: this.getStoredPath(cid),
        })
        if (res.Body) {
          return res.Body
        } else {
          throw new BlobNotFoundError()
        }
      }

    getStream(cid: CID): Promise<stream.Readable> {


        throw new Error('Method not implemented.')
    }
    hasStored(cid: CID): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    delete(cid: CID): Promise<void> {
        throw new Error('Method not implemented.')
    }

}

export default AzureBlobStore