import CryptoTools from './crypto-tools'

class SecureStorage {
    static passwordHash = '';
    
    static SaveItem(key, value)
    {
        if (key && value)
        {
            const encrypted = CryptoTools.encryptAESWithKey(value, this.passwordHash);
            if (encrypted !== false)
            {
                localStorage.setItem(key, encrypted.message + '$' + encrypted.iv + '$' + encrypted.authTag);
                return true;
            }
        }
        
        return false;
    }
    
    static async GetItem(key)
    {
        if (this.HasItem(key))
        {
            const encrypted = localStorage.getItem(key).split('$');
        
            if (encrypted.length === 3)
                return await CryptoTools.decryptAESWithKey(encrypted[0], this.passwordHash, encrypted[1], encrypted[2]);
        }
        
        return false;
    }
    
    static HasItem(key)
    {
        return localStorage.getItem(key) !== null;
    }
    
    static DeleteItem(key)
    {
        localStorage.removeItem(key);
    }
}

export default SecureStorage;