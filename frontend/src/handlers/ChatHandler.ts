import axios from 'axios'
import crypto from 'crypto'
import Constants from '@/constants'
import Message from '@/models/Message'
import MessageEncrytion from '@/encryption/MessageEncryption'
import CryptoTools from '@/encryption/CryptoTools'

export default {
    async SendMessage(receiverID: number, message: string, keyID: number) : Promise<boolean>
    {
        let recvPublicKey = await MessageEncrytion.GetPublicKey(receiverID);
        
        if (recvPublicKey)
        {
            let myPrivateKey = await MessageEncrytion.AddNewKey(receiverID, keyID);
            if (myPrivateKey)
            {
                let secret = await CryptoTools.GetSharedSecret(myPrivateKey.Key, recvPublicKey.Key);
                if (secret)
                {
                    
                }
            }
        }
        
        return false;
    }
}