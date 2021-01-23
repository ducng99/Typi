/**
 * Encryption support module for Typi.
 * 
 * Credit: https://github.com/nodejs/node-v0.x-archive/issues/6386#issuecomment-31817919
 *         https://www.techengineer.one/how-to-encrypt-decrypt-with-aes-ccm-gcm-in-node-js/
 */

import crypto from 'crypto'
import NodeRSA from 'node-rsa'

var algorithm = 'aes-256-gcm';
var inputEncoding = 'utf8';
var ivLength = 12;
var keyLength = 32;
var outputEncoding = 'hex';

export default {
    encryptMessage(message, senderPublicKey, receiverPublicKey)
    {
        let iv = crypto.randomBytes(ivLength);
        let key = crypto.randomBytes(keyLength);
        let cipher = crypto.createCipheriv(algorithm, key, iv);
        let ciphered = cipher.update(message, inputEncoding, outputEncoding);
        ciphered += cipher.final(outputEncoding);

        let nodeRSA = new NodeRSA();
        let encryptedKeySender, encryptedKeyReceiver;
        try
        {
            nodeRSA.importKey(senderPublicKey, "pkcs8-public-pem");
            encryptedKeySender = nodeRSA.encrypt(key, outputEncoding);
            nodeRSA.importKey(receiverPublicKey, "pkcs8-public-pem");
            encryptedKeyReceiver = nodeRSA.encrypt(key, outputEncoding);
        }
        catch
        {
            return false;
        }
        
        return { message: ciphered, keySender: encryptedKeySender, keyReceiver: encryptedKeyReceiver, iv: iv.toString(outputEncoding), authTag: cipher.getAuthTag().toString(outputEncoding) };
    },
    
    decryptMessage(message, privateKey, key, iv, authTag)
    {
        let nodeRSA = new NodeRSA();
        let decryptedKey;
        try
        {
            nodeRSA.importKey(privateKey, "pkcs8-private-pem");
            decryptedKey = nodeRSA.decrypt(Buffer.from(key, outputEncoding));
        }
        catch
        {
            return false;
        }
        
        let iv_buf = Buffer.from(iv, outputEncoding);
        let decipher = crypto.createDecipheriv(algorithm, decryptedKey, iv_buf);
        decipher.setAuthTag(Buffer.from(authTag, outputEncoding));
        let deciphered = decipher.update(message, outputEncoding, inputEncoding);
        deciphered += decipher.final(inputEncoding);
        
        return deciphered;
    }
}