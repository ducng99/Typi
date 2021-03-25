import CryptoTools from './CryptoTools'

class SecureStorage {
    static passwordHash = '';
    
    static async SaveItem(key : string, value : string)
    {
        if (key && value && this.passwordHash)
        {
            const encrypted = await CryptoTools.EncryptAESWithKey(value, this.passwordHash);
            if (encrypted !== false)
            {
                localStorage.setItem(key, encrypted.message + '$' + encrypted.iv + '$' + encrypted.authTag);
                return true;
            }
        }
        
        return false;
    }
    
    static async GetItem(key : string)
    {
        if (this.HasItem(key) && this.passwordHash)
        {
            const encrypted = localStorage.getItem(key)?.split('$');
        
            if (encrypted && encrypted.length === 3)
                return await CryptoTools.DecryptAESWithKey(encrypted[0], this.passwordHash, encrypted[1], encrypted[2]);
        }
        
        return false;
    }
    
    static HasItem(key : string)
    {
        return localStorage.getItem(key) !== null;
    }
    
    static DeleteItem(key : string)
    {
        localStorage.removeItem(key);
    }
}

export default SecureStorage;