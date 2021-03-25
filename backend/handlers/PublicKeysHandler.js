import MySQL from './DatabaseHandler'

class PublicKeysHandler
{
    /**
     * Set current Diffie-Hellman public key for current user
     * @param {Number} userID current user ID
     * @param {Number} receiverID receiver ID to identify which entry to update
     * @param {String} publicKey new public key
     * @param {Function} callback function to call after updating
     */
    SetPublicKey(userID, receiverID, publicKey, callback)
    {        
        let sql = '';
        if (userID < receiverID)
            sql = "UPDATE `Relationships` SET User1PublicKey = ? WHERE User1 = ? AND User2 = ? AND Status = 'Friends'";
        else
            sql = "UPDATE `Relationships` SET User2PublicKey = ? WHERE User2 = ? AND User1 = ? AND Status = 'Friends'";

        MySQL.query(sql, [publicKey, userID, receiverID], (err) =>
        {
            if (err)
            {
                console.error(err);
                callback({status: false});
            }
            else
            {
                callback({status: true});
            }
        });
    }
    
    /**
     * Get public key of receiver
     * @param {Number} userID current user ID
     * @param {Number} receiverID receiver user ID
     * @param {Function} callback Function to call after receiving
     */
    GetPublicKey(userID, receiverID, callback)
    {
        let sql = '';
        if (userID < receiverID)
            sql = "SELECT User2PublicKey \"PublicKey\" FROM `Relationships` WHERE User1 = ? AND User2 = ? AND Status = 'Friends'";
        else
            sql = "SELECT User1PublicKey \"PublicKey\" FROM `Relationships` WHERE User2 = ? AND User1 = ? AND Status = 'Friends'";
            
        MySQL.query(sql, [userID, receiverID], (err, results) =>
        {
            if (err)
            {
                console.error(err);
                callback({status: false});
            }
            else
            {
                if (results.length > 0)
                {
                    callback({status: true, publicKey: results[0].PublicKey});
                }
                else
                {
                    callback({status: false});
                }
            }
        });
    }
}

const instance = new PublicKeysHandler();

export default instance;