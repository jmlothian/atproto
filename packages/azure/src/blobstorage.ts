import { BlobStore, BlobNotFoundError } from '@atproto/repo'
import { CID } from 'multiformats/cid'
import stream from 'stream'

export class AzureBlobStore implements BlobStore {
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