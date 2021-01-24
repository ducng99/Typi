/**
 * Encryption support module for Typi.
 * 
 * Credit: https://github.com/nodejs/node-v0.x-archive/issues/6386#issuecomment-31817919
 *         https://www.techengineer.one/how-to-encrypt-decrypt-with-aes-ccm-gcm-in-node-js/
 */

import crypto from 'crypto'
import NodeRSA from "node-rsa"
import { promisify } from "util"

var algorithm = 'aes-256-gcm';
var inputEncoding = 'utf8';
var ivLength = 12;
var keyLength = 32;
var outputEncoding = 'hex';

export default {
    generateKeys()
    {
        let keys = new NodeRSA({b: 1024});
        
        return { publicKey: keys.exportKey("public"), privateKey: keys.exportKey("private") }
    },

    isPrivate(key)
    {
        try
        {
            let keys = new NodeRSA();
            keys.importKey(key, "private");

            return keys.isPrivate();
        }
        catch
        {
            return false;
        }
    },

    isPublic(key)
    {
        try
        {
            let keys = new NodeRSA();
            keys.importKey(key, "public");

            return keys.isPublic();
        }
        catch
        {
            return false;
        }
    },

    encryptMessage(message, senderPublicKey, receiverPublicKey)
    {
        try
        {
            let iv = crypto.randomBytes(ivLength);
            let key = crypto.randomBytes(keyLength);
            let cipher = crypto.createCipheriv(algorithm, key, iv);
            let ciphered = cipher.update(message, inputEncoding, outputEncoding);
            ciphered += cipher.final(outputEncoding);

            let keys = new NodeRSA();
            let encryptedKeySender, encryptedKeyReceiver;

            keys.importKey(senderPublicKey, "public");
            encryptedKeySender = keys.encrypt(key, "base64");

            keys.importKey(receiverPublicKey, "public");
            encryptedKeyReceiver = keys.encrypt(key, "base64");

            return { message: ciphered, keySender: encryptedKeySender, keyReceiver: encryptedKeyReceiver, iv: iv.toString(outputEncoding), authTag: cipher.getAuthTag().toString(outputEncoding) };
        }
        catch (e)
        {
            return false;
        }
    },

    decryptMessage(message, privateKey, key, iv, authTag)
    {
        return new Promise(resolve =>
            {
                let keys = new NodeRSA();
                keys.importKey(privateKey, "private");
                Promise.resolve(keys.decrypt(key)).then(decryptedKey => {
                    let iv_buf = Buffer.from(iv, outputEncoding);
                    let decipher = crypto.createDecipheriv(algorithm, decryptedKey, iv_buf);
                    decipher.setAuthTag(Buffer.from(authTag, outputEncoding));
                    let deciphered = decipher.update(message, outputEncoding, inputEncoding);
                    deciphered += decipher.final(inputEncoding);
                    
                    resolve(deciphered);
                });
            }
        );
    }
}