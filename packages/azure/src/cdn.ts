export class AzureCDNInvalidator implements ImageInvalidator {

    constructor() {

    }
    async invalidate(subject: string, paths: string[]) {

    }
  }
  
  export default AzureCDNInvalidator
  
  // @NOTE keep in sync with same interface in pds/src/image/invalidator.ts
  // this is separate to avoid the dependency on @atproto/pds.
  interface ImageInvalidator {
    invalidate(subject: string, paths: string[]): Promise<void>
  }
  