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
const keyLength = 32;
const outputEncoding = 'hex';

export default {
    /**
     * Generate a new Diffie-Hellman key pair
     * @returns {Promise<DiffieHellman>} a new DiffieHellman object
     */
    async GenerateDHKeys()
    {
        let keys = crypto.createDiffieHellman(512);
        keys.generateKeys();
        
        return keys;
    },
    
    /**
     * Encrypt given message with a given key
     * @param {String} message The message to be encrypted
     * @param {String} key a passphrase in hex represents 32 bytes key
     * @returns {Promise<{message : String, iv : String, authTag: String}|false>} the encrypted message, IV and AuthTag in hex
     */
    async EncryptAESWithKey(message, key)
    {
        try
        {
            let iv = crypto.randomBytes(ivLength);
            let keyBytes = Buffer.from(key, "hex");
            let cipher = crypto.createCipheriv(algorithm, keyBytes, iv);
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
     * @param {String} message The encrypted message
     * @param {String} key a passphrase in hex represents 32 bytes key
     * @param {String} iv an IV given by the cipher
     * @param {String} authTag an AuthTag given by the cipher
     * @returns {Promise<String|false>} the decrypted message
     */
    async DecryptAESWithKey(message, key, iv, authTag)
    {
        try
        {
            let iv_buf = Buffer.from(iv, outputEncoding);
            let keyBytes = Buffer.from(key, "hex");
            let decipher = crypto.createDecipheriv(algorithm, keyBytes, iv_buf);
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
    
    async hashPassword(password, salt)
    {
        try
        {
            if (!salt)
            {
                salt = crypto.randomBytes(16).toString('hex');
            }
            
            let hashed = await argon2.hash({
                pass: password,
                salt: salt
            });
            
            return { password: hashed.encoded, salt: salt }
        }
        catch
        {
            return false;
        }
    }
}