import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential,ClientSecretCredential } from '@azure/identity';
import { KeyClient, CryptographyClient } from "@azure/keyvault-keys";
import * as secp from '@noble/secp256k1'
import * as crypto from '@atproto/crypto'

export type KeyVaultConfig = { 
    vaultName: string,
    keyId: string, 
    tenant_id: string,
    client_id: string,
    client_secret: string
};

export class KeyVaultKeypair implements crypto.Keypair {
    jwtAlg = crypto.SECP256K1_JWT_ALG
    
    constructor(
        private client: CryptographyClient,
        private keyId: string,
        private publicKey: Uint8Array,
      ) {


      }
      static async load(cfg: KeyVaultConfig) {
        const { keyId, vaultName, tenant_id, client_id, client_secret } = cfg

        const credential = await new ClientSecretCredential(            
            tenant_id,
            client_id,
            client_secret
        );
        
        const keyVaultUrl = `https://${vaultName}.vault.azure.net`;
        const client = new KeyClient(keyVaultUrl, credential);

        const res = await client.getKey(keyId);

        //const res = await client.getPublicKey({ KeyId: keyId })
        if (res.id == null) {
          throw new Error('Could not find public key')
        }
        const publicKey = res.key?.e
        if(publicKey === undefined)
            throw new Error('Public key missing value')
            
        const cryptoClient = new CryptographyClient(
            res.id!,
            credential
          );

        return new KeyVaultKeypair(cryptoClient, keyId, publicKey)
      }
    async sign(msg: Uint8Array): Promise<Uint8Array> {
        const res = await this.client.sign('ECDSA_SHA_256', msg)
        const hex = secp.utils.bytesToHex(res.result);
        const sig = secp.Signature.fromHex(hex);
        const normalized = sig.normalizeS();
        return normalized.toCompactRawBytes();
    }
    did(): string {
        return crypto.formatDidKey(this.jwtAlg, this.publicKey)
    }
}

export default KeyVaultKeypair
