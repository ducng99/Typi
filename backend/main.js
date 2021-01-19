import mysql from "mysql"
import rsa from "node-rsa"
import express from "express"
import cors from "cors"
import fs from "fs"

import {GenerateRandomString} from "./utilities.js"

var app = express();
app.use(cors({origin: RegExp("ducng\.dev|\w*\.ducng\.dev")}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(10000, () => {
    console.log("Started webchat backend on port 10000");
});

var mysql_creds = JSON.parse(fs.readFileSync("/home/tom/mysql-creds.json"));

var con = mysql.createPool({
	host: "localhost",
	user: mysql_creds.username,
	password: mysql_creds.password,
	database: "webchat"
});

app.post("/register", function(req, res) {
    if (CheckCredsValid(req.body.username, req.body.password))
    {
        let sql = "INSERT INTO Users (Username, Password) VALUES (?, SHA2(?, 512));";
        con.query(sql, [req.body.username, req.body.password], function (err, result) {
            if (err)
            {
                if (err.code === "ER_DUP_ENTRY")
                {
                    res.send({status: false, msg: "Username already exists! Please choose a different one."});
                }
                else
                {
                    console.error(err);
                    res.send({status: false, msg: "MySQL query error! Admin check log"});
                }
            }
            else 
            {
                CreateSession(req.body.username, (sessionID) => {
                    if (sessionID == null)
                    {
                        res.send({status: false, msg: "Unable to generate session ID. Please contact administrator."});
                    }
                    else
                    {
                        res.send({status: true, msg: "Sucessfully registered user " + req.body.username + "!", sessionID: sessionID});
                        console.log("User " + req.body.username + " created.");
                    }
                });
            }
        });
    }
    else
    {
        res.send({status: false, msg: "Username or password not valid!"});
    }
});

app.post("/login", function(req, res) {
    if (CheckCredsValid(req.body.username, req.body.password))
    {
        let sql = "SELECT * FROM Users WHERE Username = ? AND Password = SHA2(?, 512);";
        con.query(sql, [req.body.username, req.body.password], function (err, result) {
            if (err)
            {
                console.error(err);
                res.send({status: false, msg: "MySQL query error! Admin check log"});
            }
            else
            {
                if (result.length > 0)
                {
                    CreateSession(req.body.username, (sessionID) => {
                        if (sessionID == null)
                        {
                            res.send({status: false, msg: "Unable to generate session ID. Please contact administrator."});
                        }
                        else
                        {
                            res.send({status: true, msg: "Logged in sucessfully!", sessionID: sessionID});
                        }
                    });
                }
                else
                {
                    res.send({status: false, msg: "User not found!"});
                }
            }
        });
    }
    else
    {
        res.send({status: false, msg: "Username or password not valid!"});
    }
});

app.post("/verifySession", function(req, res) {
    GetSession(req.body.sessionID, data => {
        res.send({status: data.status});
    });
});

app.post("/getUser", function(req, res) {
    GetSession(req.body.sessionID, data => {
        res.send({status: data.status, username: data.username});
    });
});

function CheckCredsValid(username, password)
{
    return (username && password && RegExp("(\\w|\\d){3,32}").test(username) && password.length >= 6);
}

function CreateSession(username, callback)
{
    let sql = "INSERT INTO Sessions (SessionID, Username, ExpireTime) VALUES (?, ?, ?);";
    let sessionID = GenerateRandomString(64);
    let expireTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    con.query(sql, [sessionID, username, expireTime], function (err, result) {
        if (err)
        {
            console.error(err);
            callback(null);
        }
        else
        {
            callback(sessionID);
        }
    });
}

function GetSession(sessionID, callback)
{
    if (sessionID)
    {
        let sql = "SELECT Username FROM Sessions WHERE SessionID = ?";
        con.query(sql, [sessionID], function(err, result) {
            if (err)
            {
                console.error(err);
                callback({status: false});
            }
            else
            {
                callback({status: true, username: result[0].Username});
            }
        });
    }
    else
    {
        console.log("GetSession: Missing session ID");
        callback({status: false});
    }
}

// ERROR HANDLING - START
//----------------------------------------------------------------------------------//
// Handle 404
app.use(function(req, res) {
    res.status(404).send({error: 404, msg: 'Page not Found'});
});

// Handle 500
app.use(function(error, req, res, next) {
    res.status(500).send({error: 500, msg: 'Internal server error'});
});
//-----------------------------------------------------------------------------------//
// ERROR HANDLING - END