import CryptoTools from './crypto-tools'

export default {
    SaveItem(key, value, password)
    {
        const encrypted = CryptoTools.encryptAESWithKey(value, password);
        if (encrypted !== false)
        {
            localStorage.setItem(key, encrypted.message + '$' + encrypted.iv + '$' + encrypted.authTag);
            return true;
        }
        else
        {
            return false;
        }
    },
    
    async GetItem(key, password)
    {
        let encrypted = localStorage.getItem(key).split('$');
        
        if (encrypted.length === 3)
            return await CryptoTools.decryptAESWithKey(encrypted[0], password, encrypted[1], encrypted[2]);
        else
            return false;
    }
}