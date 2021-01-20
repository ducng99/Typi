class UsersHandler {
    constructor() {
        this.con;
    }

    GetFriends(userID, callback)
    {
        let sql = "SELECT u.Username, r.Status, r.TargetUser FROM Users u, Relationships r WHERE r.User1 = ? AND u.UserID = r.User2 UNION SELECT u.Username, r.Status, r.TargetUser FROM Users u, Relationships r WHERE r.User2 = ? AND u.UserID = r.User1 ORDER BY Username";
        this.con.query(sql, [userID, userID], function(err, results) {
            if (err)
            {
                console.error(err);
                callback({status: false});
            }
            else
            {
                callback({status: true, friends: results});
            }
        });
    }
    
    GetUsername(userID, callback)
    {
        let sql = "SELECT Username FROM `Users` WHERE UserID = ?";
        this.con.query(sql, [userID], function (err, result) {
            if (err)
            {
                console.error(err);
                callback({status: false});
            }
            else
            {
                if (result.length > 0)
                {
                    callback({status: true, username: result[0].Username});
                }
                else
                {
                    callback({status: false});
                }
            }
        })
    }
    
    GetUserID(username, callback)
    {
        let sql = "SELECT UserID FROM `Users` WHERE Username = ?";
        this.con.query(sql, [username], function (err, result) {
            if (err)
            {
                console.error(err);
                callback({status: false});
            }
            else
            {
                if (result.length > 0)
                {
                    callback({status: true, userID: result[0].UserID});
                }
                else
                {
                    callback({status: false});
                }
            }
        })
    }
    
    /**
     * 
     * @param {Number} UserID Sender user ID
     * @param {String} targetUsername Target Username
     * @param {Function} callback Callback function
     */
    AddFriend(UserID, targetUsername, callback)
    {
        this.GetUserID(targetUsername, data => {
            if (data.status)
            {
                if (UserID != data.userID)
                {
                    let user1 = UserID < data.userID ? UserID : data.userID;
                    let user2 = user1 != UserID ? UserID : data.userID;
                    
                    let sql = "INSERT INTO Relationships (User1, User2, Status, TargetUser) VALUES (?, ?, 'Pending', ?)";
                    this.con.query(sql, [user1, user2, data.userID], function (err) {
                        if (err)
                        {
                            if (err.code === "ER_DUP_ENTRY")
                            {
                                callback({status: false, msg: "This person already exists in your list."});
                            }
                            else
                            {
                                console.error(err);
                                callback({status: false, msg: "MySQL query error. Admin check log"});
                            }
                        }
                        else
                        {
                            callback({status: true, msg: "Sent friend request!"});
                        }
                    });
                }
                else
                {
                    callback({status: false, msg: "Cannot add yourself!"});
                }
            }
            else
            {
                callback({status: false, msg: "User does not exists!"});
            }
        });
    }
    
    /**
     * Get Messages from/to an user
     * @param {Number} userID User ID of user
     * @param {Function} callback Callback function to return results
     */
    GetMessages(userID, callback)
    {
        let sql = "SELECT * FROM Messages WHERE Sender = ? OR Receiver = ? ORDER BY SendTime DESC";
        this.con.query(sql, [userID, userID], function(err, results) {
            if (err)
            {
                console.error(err);
                callback({status: false});
            }
            else
            {
                callback({status: true, messages: results});
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
        let sql = "INSERT INTO Messages (Sender, Receiver, Content, SendTime) VALUES (?, ?, ?, ?)";
        let time = Math.floor(Date.now() / 1000);
        this.con.query(sql, [senderID, receiverID, content, time], function(err) {
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
}

export default new UsersHandler();