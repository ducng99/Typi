import CryptoTools from './crypto-tools'

export default {
    passwordHash,
    
    SaveItem(key, value)
    {
        if (key && value)
        {
            const encrypted = CryptoTools.encryptAESWithKey(value, passwordHash);
            if (encrypted !== false)
            {
                localStorage.setItem(key, encrypted.message + '$' + encrypted.iv + '$' + encrypted.authTag);
                return true;
            }
        }
        
        return false;
    },
    
    async GetItem(key)
    {
        if (this.HasItem(key))
        {
            let encrypted = localStorage.getItem(key).split('$');
        
            if (encrypted.length === 3)
                return await CryptoTools.decryptAESWithKey(encrypted[0], passwordHash, encrypted[1], encrypted[2]);
        }
        
        return false;
    },
    
    HasItem(key)
    {
        return localStorage.getItem(key) !== null;
    },
    
    DeleteItem(key)
    {
        localStorage.removeItem(key);
    }
}