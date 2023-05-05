import { DefaultAzureCredential,ClientSecretCredential } from '@azure/identity';
import { SecretClient } from "@azure/keyvault-secrets";
import * as secp from '@noble/secp256k1'
import * as crypto from '@atproto/crypto'
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import * as ui8 from 'uint8arrays'

export type KeyVaultConfig = { 
    vaultName: string,
    publicKeyId: string, 
    privateKeyId: string,
    tenantId: string,
    clientId: string,
    clientSecret: string
};

export class KeyVaultKeypair implements crypto.Keypair {
    jwtAlg = crypto.SECP256K1_JWT_ALG

    constructor(
        private client: SecretClient,
        private publicKey: Uint8Array,
        private privateKey: Uint8Array,
      ) {


      }
      static async load(cfg: KeyVaultConfig) {
        const { publicKeyId, privateKeyId, vaultName, tenantId, clientId, clientSecret } = cfg

        
        const credential = new ClientSecretCredential(            
            tenantId,
            clientId,
            clientSecret
        );
        
        //const credential = new DefaultAzureCredential();
        const keyVaultUrl = `https://${vaultName}.vault.azure.net`;

        // Azure keyvault doesn't let you retrieve public keys, so
        // the cloud-side signing method won't work and we have 
        // to store both the private and public key as secrets.
        // This is not a good idea. Use AWS or GCP. Provided only for 
        // testing and extreme cases where AWS and GCP are not
        // available.
        const client = new SecretClient(keyVaultUrl, credential);

        //public key
        const resultPub = await client.getSecret(publicKeyId);
        if(resultPub.value === undefined)
            throw new Error("Could not find public key")
        const publicKey = Buffer.from(resultPub.value, 'base64')
        
        const result = await client.getSecret(privateKeyId);
        if(result.value === undefined)
            throw new Error("Could not find private key")
        const privateKey = Buffer.from(result.value, 'base64')

        return new KeyVaultKeypair(client, publicKey, privateKey)
      }
    async sign(msg: Uint8Array): Promise<Uint8Array> {
        var hash = sha256(msg);
        const signature = await secp.signAsync(hash, this.privateKey);
        return signature.toCompactRawBytes();
    }
    did(): string {
        return crypto.formatDidKey(this.jwtAlg, this.publicKey)
    }
}

export default KeyVaultKeypair
