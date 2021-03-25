import MySQL from './DatabaseHandler'

class UsersHandler
{
    GetFriends(userID, callback)
    {
        let sql = "SELECT u.UserID, u.Username, r.Status, r.TargetUser FROM `Users` u, `Relationships` r WHERE (r.User1 = ? AND u.UserID = r.User2) OR (r.User2 = ? AND u.UserID = r.User1) ORDER BY u.Username";
        MySQL.query(sql, [userID, userID], function (err, results)
        {
            if (err)
            {
                console.error(err);
                callback({ status: false });
            }
            else
            {
                callback({ status: true, friends: results });
            }
        });
    }

    GetUsername(userID, callback)
    {
        let sql = "SELECT Username FROM `Users` WHERE UserID = ?";
        MySQL.query(sql, [userID], function (err, result)
        {
            if (err)
            {
                console.error(err);
                callback({ status: false });
            }
            else
            {
                if (result.length > 0)
                {
                    callback({ status: true, username: result[0].Username });
                }
                else
                {
                    callback({ status: false });
                }
            }
        });
    }

    GetUserID(username, callback)
    {
        let sql = "SELECT UserID FROM `Users` WHERE Username = ?";
        MySQL.query(sql, [username], function (err, result)
        {
            if (err)
            {
                console.error(err);
                callback({ status: false });
            }
            else
            {
                if (result.length > 0)
                {
                    callback({ status: true, userID: result[0].UserID });
                }
                else
                {
                    callback({ status: false });
                }
            }
        });
    }

    /**
     * 
     * @param {Number} UserID Sender user ID
     * @param {String} targetUsername Target Username
     * @param {Function} callback Callback function
     */
    AddFriend(UserID, targetUsername, callback)
    {
        this.GetUserID(targetUsername, data =>
        {
            if (data.status)
            {
                if (UserID != data.userID)
                {
                    let user1 = UserID < data.userID ? UserID : data.userID;
                    let user2 = user1 != UserID ? UserID : data.userID;

                    let sql = "INSERT INTO `Relationships` (User1, User2, Status, TargetUser) VALUES (?, ?, 'Pending', ?)";
                    MySQL.query(sql, [user1, user2, data.userID], function (err)
                    {
                        if (err)
                        {
                            if (err.code === "ER_DUP_ENTRY")
                            {
                                callback({ status: false, msg: "This person already exists in your list." });
                            }
                            else
                            {
                                console.error(err);
                                callback({ status: false, msg: "MySQL query error. Admin check log" });
                            }
                        }
                        else
                        {
                            callback({ status: true, msg: "Sent friend request!" });
                        }
                    });
                }
                else
                {
                    callback({ status: false, msg: "Cannot add yourself!" });
                }
            }
            else
            {
                callback({ status: false, msg: "User does not exists!" });
            }
        });
    }

    UpdateRelationship(userID, targetID, relationship, callback)
    {
        if (RegExp("^(Friends|Blocked|None)$").test(relationship))
        {
            let user1 = userID < targetID ? userID : targetID;
            let user2 = user1 != userID ? userID : targetID;
            let sql = "";

            switch (relationship)
            {
                case "Friends":
                    sql = "UPDATE `Relationships` SET Status = 'Friends' WHERE User1 = ? AND User2 = ? AND TargetUser = ?";
                    MySQL.query(sql, [user1, user2, userID], handle);
                    break;
                case "Blocked":
                    sql = "UPDATE `Relationships` SET Status = 'Blocked', TargetUser = ? WHERE User1 = ? AND User2 = ?";
                    MySQL.query(sql, [targetID, user1, user2], handle);
                    break;
                case "None":
                    sql = "DELETE FROM `Relationships` WHERE User1 = ? AND User2 = ? AND ((Status = 'Blocked' AND TargetUser = ?) OR Status != 'Blocked')";
                    MySQL.query(sql, [user1, user2, targetID], handle);
                    break;
                default:
                    callback({status: false});
                    break;
            }
            
            function handle(err) {
                if (err)
                {
                    console.error(err);
                    callback({status: false});
                }
                else
                {
                    callback({status: true});
                }
            }
        }
        else
        {
            callback({ status: false });
        }
    }

    /**
     * Get Messages from/to an user
     * @param {Number} userID User ID of user
     * @param {Number} targetID User ID of receiver
     * @param {Function} callback Callback function to return results
     */
    GetMessages(userID, targetID, callback)
    {
        let sql = "SELECT * FROM `Messages` WHERE (Sender = ? AND Receiver = ?) OR (Receiver = ? AND Sender = ?) ORDER BY MessageID DESC LIMIT 40";
        MySQL.query(sql, [userID, targetID, userID, targetID], function (err, results)
        {
            if (err)
            {
                console.error(err);
                callback({ status: false });
            }
            else
            {
                callback({ status: true, messages: results });
            }
        });
    }

    /**
     * Send a message
     * @param {Number} senderID User ID of sender
     * @param {Number} receiverID User ID of receiver
     * @param {Object} encryptedData Encrypted message data. Contains encrypted message, key for sender, key for receiver and iv
     * @param {Function} callback Callback function
     */
    SendMessage(senderID, receiverID, encryptedData, callback)
    {
        if (senderID && receiverID && encryptedData)
        {
            let user1 = senderID < receiverID ? senderID : receiverID;
            let user2 = user1 != senderID ? senderID : receiverID;
            
            let sql = "INSERT INTO `Messages` (Sender, Receiver, Content, KeySender, KeyReceiver, IV, AuthTag, SendTime) SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT Status FROM `Relationships` WHERE User1 = ? AND User2 = ?) = 'Friends'";
            let time = Math.floor(Date.now() / 1000);
            MySQL.query(sql, [senderID, receiverID, encryptedData.message, encryptedData.keySender, encryptedData.keyReceiver, encryptedData.iv, encryptedData.authTag, time, user1, user2], function (err)
            {
                if (err)
                {
                    console.error(err);
                    callback({ status: false });
                }
                else
                {
                    callback({ status: true });
                }
            });
        }
        else
        {
            callback({status: false});
        }
    }
}

const instance = new UsersHandler();

export default instance;