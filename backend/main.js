import mysql from "mysql"
import express from "express"
import cors from "cors"
import fs from "fs"
import crypto from "crypto"
import cookieParser from 'cookie-parser'

import SessionsHandler from "./sessions"
import UsersHandler from "./users"
import { CheckCredsValid, GenerateRandomString } from "./utilities"
import UsersRouter from './routers/usersRouter'
import SessionsRouter from './routers/sessionsRouter'
import ChatRouter from './routers/chatRouter'

var app = express();
app.use(cors({
    origin: ["https://ducng.dev", "https://ducng.dev:2053", /\.ducng\.dev$/],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.listen(10000, () =>
{
    console.log("Started webchat backend on port 10000");
});

var mysql_creds = JSON.parse(fs.readFileSync("../../mysql-creds.json"));
var passwordSaltLength = 32;
var passwordKeyLength = 64;
var passwordCPUCost = 1024;
var passwordOutputEncoding = "hex";
const COOKIE_SESSION_ID = "Typi_Session_ID";

var con = mysql.createPool({
    host: "localhost",
    user: mysql_creds.username,
    password: mysql_creds.password,
    database: "Typi"
});

SessionsHandler.con = con;
UsersHandler.con = con;

app.use("/users", UsersRouter);
app.use("/sessions", SessionsRouter);
app.use("/chat", ChatRouter);

app.post("/register", function (req, res)
{
    if (CheckCredsValid(req.body.username, req.body.password))
    {
        let passSalt = GenerateRandomString(passwordSaltLength);
        let encPassword = crypto.scryptSync(req.body.password, passSalt, passwordKeyLength, {N: passwordCPUCost}).toString(passwordOutputEncoding);
        
        let sql = "INSERT INTO Users (Username, Password, PasswordSalt) VALUES (?, ?, ?);";
        con.query(sql, [req.body.username, encPassword, passSalt], function (err)
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
                        res.cookie(COOKIE_SESSION_ID, sessionID, {secure: true, domain: req.body.sender, httpOnly: true}).send({ status: true, msg: "Successfully registered user " + req.body.username + "!" });
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
        let sql = "SELECT Password, PasswordSalt FROM Users WHERE Username = ?";
        con.query(sql, [req.body.username], function (err, result)
        {
            if (err)
            {
                console.error(err);
                res.send({ status: false, msg: "MySQL query error! Admin check log" });
            }
            else
            {
                if (result.length > 0 )
                {
                    let encPassword = crypto.scryptSync(req.body.password, result[0].PasswordSalt, passwordKeyLength, {N: passwordCPUCost}).toString(passwordOutputEncoding);
                    
                    if (crypto.timingSafeEqual(Buffer.from(encPassword), Buffer.from(result[0].Password)))
                    {
                        SessionsHandler.CreateSession(req.body.username, (sessionID) =>
                        {
                            if (sessionID == null)
                            {
                                res.send({ status: false, msg: "Unable to generate session ID. Please contact administrator." });
                            }
                            else
                            {
                                res.cookie(COOKIE_SESSION_ID, sessionID, {secure: true, domain: req.body.sender, httpOnly: true }).send({ status: true, msg: "Logged in successfully!" });
                            }
                        });
                    }
                    else
                    {
                        res.send({ status: false, msg: "Username or password not valid!" });
                    }
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

app.get("/logout", function (req, res)
{
    con.query("DELETE FROM `Sessions` WHERE SessionID = ?", [req.cookies[COOKIE_SESSION_ID]], (err) =>
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
//-----------------------------------------------------------------------------------//
// ERROR HANDLING - END