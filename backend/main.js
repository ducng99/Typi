import mysql from "mysql"
import express from "express"
import cors from "cors"
import fs from "fs"

import SessionsHandler from "./sessions.js"
import UsersHandler from "./users"
import { CheckCredsValid } from "./utilities.js"

var app = express();
app.use(cors({ origin: RegExp("ducng\.dev|\w*\.ducng\.dev") }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(10000, () =>
{
    console.log("Started webchat backend on port 10000");
});

var mysql_creds = JSON.parse(fs.readFileSync("/home/tom/mysql-creds.json"));

var con = mysql.createPool({
    host: "localhost",
    user: mysql_creds.username,
    password: mysql_creds.password,
    database: "Typi"
});

SessionsHandler.con = con;
UsersHandler.con = con;

app.post("/register", function (req, res)
{
    if (CheckCredsValid(req.body.username, req.body.password))
    {
        let sql = "INSERT INTO Users (Username, Password) VALUES (?, SHA2(?, 512));";
        con.query(sql, [req.body.username, req.body.password], function (err, result)
        {
            if (err)
            {
                if (err.code === "ER_DUP_ENTRY")
                {
                    res.send({ status: false, msg: "Username already exists! Please choose a different one." });
                }
                else
                {
                    console.error(err);
                    res.send({ status: false, msg: "MySQL query error! Admin check log" });
                }
            }
            else
            {
                SessionsHandler.CreateSession(req.body.username, (sessionID) =>
                {
                    if (sessionID == null)
                    {
                        res.send({ status: false, msg: "Unable to generate session ID. Please contact administrator." });
                    }
                    else
                    {
                        res.send({ status: true, msg: "Successfully registered user " + req.body.username + "!", sessionID: sessionID });
                        console.log("User " + req.body.username + " created.");
                    }
                });
            }
        });
    }
    else
    {
        res.send({ status: false, msg: "Username or password not valid!" });
    }
});

app.post("/login", function (req, res)
{
    if (CheckCredsValid(req.body.username, req.body.password))
    {
        let sql = "SELECT * FROM Users WHERE Username = ? AND Password = SHA2(?, 512);";
        con.query(sql, [req.body.username, req.body.password], function (err, result)
        {
            if (err)
            {
                console.error(err);
                res.send({ status: false, msg: "MySQL query error! Admin check log" });
            }
            else
            {
                if (result.length > 0)
                {
                    SessionsHandler.CreateSession(req.body.username, (sessionID) =>
                    {
                        if (sessionID == null)
                        {
                            res.send({ status: false, msg: "Unable to generate session ID. Please contact administrator." });
                        }
                        else
                        {
                            res.send({ status: true, msg: "Logged in successfully!", sessionID: sessionID });
                        }
                    });
                }
                else
                {
                    res.send({ status: false, msg: "User not found!" });
                }
            }
        });
    }
    else
    {
        res.send({ status: false, msg: "Username or password not valid!" });
    }
});

app.post("/logout", function (req, res)
{
    con.query("DELETE FROM `Sessions` WHERE SessionID = ?", [req.body.sessionID], (err) =>
    {
        if (err)
        {
            console.error(err);
            res.send({ status: false });
        }
        else
        {
            res.send({ status: true });
        }
    })
})

app.post("/verifySession", function (req, res)
{
    SessionsHandler.GetSession(req.body.sessionID, data =>
    {
        res.send({ status: data.status });
    });
});

app.post("/users/get", function (req, res)
{
    SessionsHandler.GetSession(req.body.sessionID, data =>
    {
        res.send({ status: data.status, user: data.user });
    });
});

app.post("/users/getFriends", function (req, res)
{
    SessionsHandler.GetSession(req.body.sessionID, data =>
    {
        if (data.status)
        {
            UsersHandler.GetFriends(data.user.UserID, data2 =>
            {
                if (data2.status)
                {
                    res.send({ status: true, friends: data2.friends });
                }
                else
                {
                    res.send({ status: false });
                }
            });
        }
        else
        {
            res.send({ status: false });
        }
    });
});

app.post("/users/addFriend", function (req, res)
{
    SessionsHandler.GetSession(req.body.sessionID, data =>
    {
        if (data.status)
        {
            UsersHandler.AddFriend(data.user.UserID, req.body.targetUsername, data2 =>
            {
                res.send({ status: data2.status, msg: data2.msg });
            });
        }
        else
        {
            res.send({ status: false, msg: "Unable to verify your session." });
        }
    });
});

app.post("/users/updateRelationship", function (req, res)
{
    SessionsHandler.GetSession(req.body.sessionID, data =>
    {
        if (data.status)
        {
            UsersHandler.GetUserID(req.body.targetUsername, data2 =>
            {
                if (data2.status)
                {
                    UsersHandler.UpdateRelationship(data.user.UserID, data2.userID, req.body.relationship, data3 =>
                    {
                        res.send({ status: data3.status });
                    });
                }
                else
                {
                    res.send({ status: false });
                }
            });
        }
        else
        {
            res.send({ status: false });
        }
    })
});

app.post("/users/getMessages", function (req, res)
{
    SessionsHandler.GetSession(req.body.sessionID, data =>
    {
        if (data.status)
        {
            UsersHandler.GetUserID(req.body.receiver, data2 =>
            {
                if (data2.status)
                {
                    UsersHandler.GetMessages(data.user.UserID, data2.userID, data3 =>
                    {
                        if (data3.status)
                        {
                            res.send({ status: true, messages: data3.messages });
                        }
                        else
                        {
                            res.send({ status: false });
                        }
                    });
                }
                else
                {
                    res.send({ status: false });
                }
            });
        }
        else
        {
            res.send({ status: false });
        }
    });
});

app.post("/users/sendMessage", function (req, res)
{
    if (req.body.message)
    {
        SessionsHandler.GetSession(req.body.sessionID, data =>
        {
            if (data.status)
            {
                UsersHandler.GetUserID(req.body.receiver, data2 =>
                {
                    if (data2.status)
                    {
                        UsersHandler.SendMessage(data.user.UserID, data2.userID, req.body.message, data3 =>
                        {
                            res.send({ status: data3.status });
                        });
                    }
                    else
                    {
                        res.send({ status: false });
                    }
                });
            }
            else
            {
                res.send({ status: false });
            }
        });
    }
});

setInterval(function ()
{
    con.query("DELETE FROM `Sessions` WHERE ExpireTime < ?", [Math.floor(Date.now() / 1000)], function (err)
    {
        if (err)
        {
            console.error(err);
        }
        else
        {
            console.info("Cleared sessions.");
        }
    });
}, 60000 * 10);

// ERROR HANDLING - START
//----------------------------------------------------------------------------------//
// Handle 404
app.use(function (req, res)
{
    res.status(404).send({ error: 404, msg: 'Page not Found' });
});

// Handle 500
app.use(function (error, req, res, next)
{
    res.status(500).send({ error: 500, msg: 'Internal server error' });
});
//-----------------------------------------------------------------------------------//
// ERROR HANDLING - END