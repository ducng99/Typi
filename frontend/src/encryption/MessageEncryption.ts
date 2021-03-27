import CryptoTools from '@/encryption/CryptoTools'

export default {
    /**
     * Encrypt plain text message with AES
     * @param message plain text message to be encrypted
     * @param secret Diffie-Hellman shared secret
     * @param prevChainKey previous chain key, to be used as salt when hashing
     * @param iteration how many times to hash Argon2
     * @returns an object containing encrypted message, IV and auth tag
     */
    async EncryptMessage(message: string, secret: Buffer, prevChainKey: string, iteration: number)
    : Promise<{encrypted: {message: string, iv: string, authTag: string}, newChainKey: string}|false>
    {
        let chainKey = await CryptoTools.HashString(secret.toString(), prevChainKey, iteration);
        if (chainKey)
        {
            let result = await CryptoTools.EncryptAESWithKey(message, chainKey.hashed);
            if (result)
            {
                return {encrypted: result, newChainKey: chainKey.hashed};
            }
        }
        
        return false;
    }
}