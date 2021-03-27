import CryptoTools from '@/encryption/CryptoTools'
import SecureStorage from '@/encryption/SecureStorage'
import Constants from '@/constants'
import ChatInfo from '@/models/ChatInfo'
import PrivateKey from '@/models/PrivateKey'
import PublicKey from '@/models/PublicKey'
import axios from 'axios'

export default {
    /**
     * Read keys from storage and put into {listKeys}
     * @param userID current user ID for storage access
     * @param listChatInfos object to return read infos
     */
    UpdateStorageChatInfos(userID : number, listChatInfos : Record<number, ChatInfo>) : void
    {
        SecureStorage.GetItem(Constants.STORAGE_CHAT_INFOS + userID)
        .then(value => {            
            if (value)
            {
                try
                {
                    const keys = JSON.parse(value);
            
                    if (keys && keys.length > 0)
                    {
                        Object.assign(listChatInfos, keys);
                    }
                }
                catch (e)
                {
                    console.error(e);
                }
            }
        });
    },
    
    /**
     * Save list of private keys to SecureStorage
     * @param userID current user ID
     * @param listChatInfos list of chat infos to save
     * @returns true if successfully saved, false otherwise
     */
    async SaveStorageChatInfos(userID: number, listChatInfos : Record<number, ChatInfo[]>) : Promise<boolean>
    {
        return await SecureStorage.SaveItem(Constants.STORAGE_CHAT_INFOS + userID, JSON.stringify(listChatInfos));
    },

    /**
     * Generate a new Diffie-Hellman key and send to server to update.
     * @param receiverID receiver user ID
     * @returns a Key object containing keyID and public key generated. Return false if failed
     */
    async AddNewKey(receiverID : number, keyID : number) : Promise<PrivateKey|false>
    {
        const keys = await CryptoTools.GenerateDHKeys();
        if (keys)
        {
            const publicKeyEntry = new PublicKey(keyID, keys.getPublicKey().toString('hex'));
            const data = Buffer.from(JSON.stringify(publicKeyEntry.toJSON())).toString('base64');
            
            const res = await axios.post(Constants.BACKEND_SERVER_ADDR + "/publickeys/updatePublicKey",
            {
                receiverID: receiverID,
                publicKey: data
            });
            
            if (res.data.status)
            {
                return new PrivateKey(keyID, keys.getPrivateKey().toString('hex'));
            }
        }
        
        return false;
    },
    
    /**
     * Get receiver's public key and key ID
     * @param receiverID receiver user ID
     * @returns a PublicKey object containing receiver's public key and key ID
     */
    async GetPublicKey(receiverID : number) : Promise<PublicKey|false>
    {
        const res = await axios.post(Constants.BACKEND_SERVER_ADDR + "/publickeys/getPublicKey",
        {
            receiverID: receiverID
        });
        
        if (res.data.status)
        {
            try
            {
                const publicKeyData = JSON.parse(Buffer.from(res.data.publicKey, 'base64').toString('utf-8'));
                
                return new PublicKey(publicKeyData.ID, publicKeyData.PublicKey);
            }
            catch (e)
            {
                console.error(e);
            }
        }
        
        return false;
    }
}