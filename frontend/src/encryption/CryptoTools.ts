/**
 * Encryption support module for Typi.
 * 
 * Credits: https://github.com/nodejs/node-v0.x-archive/issues/6386#issuecomment-31817919
 *          https://www.techengineer.one/how-to-encrypt-decrypt-with-aes-ccm-gcm-in-node-js/
 *          https://github.com/antelle/argon2-browser/
 */

import crypto, { DiffieHellman } from 'crypto'
import argon2 from "argon2-browser"

const algorithm = 'aes-256-gcm';
const inputEncoding = 'utf8';
const ivLength = 12;
const outputEncoding = 'hex';

export default {
    /**
     * Generate a new Diffie-Hellman key pair
     * @returns {Promise<DiffieHellman>} a new DiffieHellman object
     */
    async GenerateDHKeys(): Promise<DiffieHellman|false>
    {
        try
        {
            const keys = crypto.getDiffieHellman('modp14'); // 2048-bit prime
            keys.generateKeys();
            
            return keys;
        }
        catch
        {
            return false;
        }
    },
    
    /**
     * Get shared secret from our key pair and receiver's public key
     * @param {string} senderPrivateKey sender private key in hex
     * @param {string} receiverPublicKey receiver public key in hex
     * @returns {Buffer} a buffer containing the shared secret key
     */
    async GetSharedSecret(senderPrivateKey: string, receiverPublicKey: string): Promise<Buffer|false>
    {
        try
        {
            const senderKeys = crypto.getDiffieHellman('modp14');
            senderKeys.setPrivateKey(senderPrivateKey, 'hex');
            return senderKeys.computeSecret(receiverPublicKey, 'hex');
        }
        catch
        {
            return false;
        }
    },
    
    /**
     * Encrypt given message with a given key
     * @param {string} message The message to be encrypted
     * @param {string} key a passphrase in hex represents 32 bytes key
     * @returns {Promise<{message : string, iv : string, authTag: string}|false>} the encrypted message, IV and AuthTag in hex
     */
    async EncryptAESWithKey(message: string, key: string): Promise<{ message: string; iv: string; authTag: string; } | false>
    {
        try
        {
            const iv = crypto.randomBytes(ivLength);
            const keyBytes = Buffer.from(key, "hex");
            const cipher = crypto.createCipheriv(algorithm, keyBytes, iv);
            let ciphered = cipher.update(message, inputEncoding, outputEncoding);
            ciphered += cipher.final(outputEncoding);

            return { message: ciphered, iv: iv.toString(outputEncoding), authTag: cipher.getAuthTag().toString(outputEncoding) };
        }
        catch
        {
            return false;
        }
    },
    
    /**
     * Decrypt given message with a given key
     * @param {string} message The encrypted message
     * @param {string} key a passphrase in hex represents 32 bytes key
     * @param {string} iv an IV given by the cipher
     * @param {string} authTag an AuthTag given by the cipher
     * @returns {Promise<string|false>} the decrypted message
     */
    async DecryptAESWithKey(message: string, key: string, iv: string, authTag: string): Promise<string | false>
    {
        try
        {
            const iv_buf = Buffer.from(iv, outputEncoding);
            const keyBytes = Buffer.from(key, "hex");
            const decipher = crypto.createDecipheriv(algorithm, keyBytes, iv_buf);
            decipher.setAuthTag(Buffer.from(authTag, outputEncoding));
            let deciphered = decipher.update(message, outputEncoding, inputEncoding);
            deciphered += decipher.final(inputEncoding);
            
            return deciphered;
        }
        catch
        {
            return false;
        }
    },
    
    async HashString(message : string, salt?: string, times?: number): Promise<false | { hashed: string, salt: string }>
    {
        try
        {
            if (!salt)
            {
                salt = crypto.randomBytes(16).toString('hex');
            }
            
            const hashed = await argon2.hash({
                pass: message,
                salt: salt,
                time: times ?? 1,
                type: argon2.ArgonType.Argon2id
            });
            
            return { hashed: hashed.hashHex, salt: salt }
        }
        catch
        {
            return false;
        }
    }
}