class UsersHandler {
    constructor() {
        this.con;
    }

    GetFriends(userID, callback)
    {
        let sql = "SELECT u.UserID, u.Username FROM Users u, Relationships r WHERE u.UserID = ? AND (u.UserID = r.User1 OR u.UserID = r.User2);";
        this.con.query(sql, [userID], function(err, results) {
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
}

export default new UsersHandler();