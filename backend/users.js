class UsersHandler
{
    constructor()
    {
        this.con;
    }

    GetFriends(userID, callback)
    {
        let sql = "SELECT u.Username, r.Status, r.TargetUser FROM `Users` u, `Relationships` r WHERE (r.User1 = ? AND u.UserID = r.User2) OR (r.User2 = ? AND u.UserID = r.User1) ORDER BY u.Username";
        this.con.query(sql, [userID, userID], function (err, results)
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
        this.con.query(sql, [userID], function (err, result)
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
        this.con.query(sql, [username], function (err, result)
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
                    this.con.query(sql, [user1, user2, data.userID], function (err)
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
                    this.con.query(sql, [user1, user2, userID], handle);
                    break;
                case "Blocked":
                    sql = "UPDATE `Relationships` SET Status = 'Blocked', TargetUser = ? WHERE User1 = ? AND User2 = ?";
                    this.con.query(sql, [targetID, user1, user2], handle);
                    break;
                case "None":
                    sql = "DELETE FROM `Relationships` WHERE User1 = ? AND User2 = ? AND ((Status = 'Blocked' AND TargetUser = ?) OR Status != 'Blocked')";
                    this.con.query(sql, [user1, user2, targetID], handle);
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
        let sql = "SELECT * FROM `Messages` WHERE (Sender = ? AND Receiver = ?) OR (Receiver = ? AND Sender = ?) ORDER BY MessageID DESC LIMIT 20";
        this.con.query(sql, [userID, targetID, userID, targetID], function (err, results)
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
     * @param {String} content Message to be sent
     * @param {Function} callback Callback function
     */
    SendMessage(senderID, receiverID, content, callback)
    {
        let sql = "INSERT INTO `Messages` (Sender, Receiver, Content, SendTime) VALUES (?, ?, ?, ?)";
        let time = Math.floor(Date.now() / 1000);
        this.con.query(sql, [senderID, receiverID, content, time], function (err)
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
}

export default new UsersHandler();