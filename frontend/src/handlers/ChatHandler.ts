import axios from 'axios'
import Constants from '@/constants'
import Message from '@/models/Message'
import PrivateKey from '@/models/PrivateKey'
import ChatInfo from '@/models/ChatInfo'
import KeysManager from '@/encryption/KeysManager'
import CryptoTools from '@/encryption/CryptoTools'
import MessageEncryption from '@/encryption/MessageEncryption'

export default {
    async SendMessage(receiverID: number, message: string, info: ChatInfo)
    : Promise<{newPrivateKey: PrivateKey, newChainKey: string}|false>
    {
        let recvPublicKey = await KeysManager.GetPublicKey(receiverID);
        
        if (recvPublicKey)
        {
            let myPrivateKeyID = 1;
            if (info.myPrivateKeys.length > 0)
            {
                myPrivateKeyID = info.myPrivateKeys[info.myPrivateKeys.length - 1].ID + 1;
            }
            
            let myPrivateKey = await KeysManager.AddNewKey(receiverID, myPrivateKeyID);
            if (myPrivateKey)
            {
                let secret = await CryptoTools.GetSharedSecret(myPrivateKey.Key, recvPublicKey.Key);
                if (secret)
                {
                    let encryptedMsg = await MessageEncryption.EncryptMessage(message, secret, info.prevHash, info.receiverIteration);
                    if (encryptedMsg)
                    {
                        let res = await axios.post(Constants.BACKEND_SERVER_ADDR + "/chat/sendMessage",
                        {
                            receiverID,
                            encryptedData: Buffer.from(JSON.stringify(encryptedMsg.encrypted)).toString('base64'),
                            keyID: recvPublicKey.ID
                        });
                        
                        if (res.data.status)
                        {
                            return { newPrivateKey: myPrivateKey, newChainKey: encryptedMsg.newChainKey };
                        }
                    }
                }
            }
        }
        
        return false;
    }
}