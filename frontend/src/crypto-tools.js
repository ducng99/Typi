/**
 * Encryption support module for Typi.
 * 
 * Credits: https://github.com/nodejs/node-v0.x-archive/issues/6386#issuecomment-31817919
 *          https://www.techengineer.one/how-to-encrypt-decrypt-with-aes-ccm-gcm-in-node-js/
 *          https://github.com/rzcoder/node-rsa
 */

import crypto from 'crypto'
import NodeRSA from "node-rsa"
import argon2 from "argon2-browser"

var algorithm = 'aes-256-gcm';
var inputEncoding = 'utf8';
var ivLength = 12;
var keyLength = 32;
var outputEncoding = 'hex';

export default {
    async generateKeys()
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
    
    encryptAESWithKey(message, key)
    {
        try
        {
            let iv = crypto.randomBytes(ivLength);
            let keyBytes = Buffer.from(key, 'hex');
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
    
    decryptAESWithKey(message, key, iv, authTag)
    {
        return new Promise(resolve => {
            let iv_buf = Buffer.from(iv, outputEncoding);
            let keyBytes = Buffer.from(key, 'hex');
            let decipher = crypto.createDecipheriv(algorithm, keyBytes, iv_buf);
            decipher.setAuthTag(Buffer.from(authTag, outputEncoding));
            let deciphered = decipher.update(message, outputEncoding, inputEncoding);
            deciphered += decipher.final(inputEncoding);
            
            resolve(deciphered);
        });
    },

    encryptMessage(message, receiverPublicKey)
    {
        try
        {
            let iv = crypto.randomBytes(ivLength);
            let key = crypto.randomBytes(keyLength);
            let cipher = crypto.createCipheriv(algorithm, key, iv);
            let ciphered = cipher.update(message, inputEncoding, outputEncoding);
            ciphered += cipher.final(outputEncoding);

            let keys = new NodeRSA();
            let encryptedKeyReceiver;

            keys.importKey(receiverPublicKey, "public");
            encryptedKeyReceiver = keys.encrypt(key, "base64");

            return { message: ciphered, keyReceiver: encryptedKeyReceiver, iv: iv.toString(outputEncoding), authTag: cipher.getAuthTag().toString(outputEncoding) };
        }
        catch
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
    },
    
    async hashPassword(password, salt = null)
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