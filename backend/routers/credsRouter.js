import express from 'express'
import crypto from "crypto"
import MySQL from '../database'
import SessionsHandler from '../sessions'
import { CheckCredsValid, GenerateRandomString } from "../utilities"

const router = express.Router();
const passwordSaltLength = 32;
const passwordKeyLength = 64;
const passwordCPUCost = 1024;
const passwordOutputEncoding = "hex";
const COOKIE_SESSION_ID = "Typi_Session_ID";

router.post("/register", function (req, res)
{
    if (CheckCredsValid(req.body.username, req.body.password))
    {
        let passSalt = GenerateRandomString(passwordSaltLength);
        let encPassword = crypto.scryptSync(req.body.password, passSalt, passwordKeyLength, {N: passwordCPUCost}).toString(passwordOutputEncoding);
        
        let sql = "INSERT INTO Users (Username, Password, PasswordSalt) VALUES (?, ?, ?);";
        MySQL.query(sql, [req.body.username, encPassword, passSalt], function (err)
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

router.post("/login", function (req, res)
{
    if (CheckCredsValid(req.body.username, req.body.password))
    {
        let sql = "SELECT Password, PasswordSalt FROM Users WHERE Username = ?";
        MySQL.query(sql, [req.body.username], function (err, result)
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

router.get("/logout", function (req, res)
{
    MySQL.query("DELETE FROM `Sessions` WHERE SessionID = ?", [req.cookies[COOKIE_SESSION_ID]], (err) =>
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

router.get("/getPublicKeys", (req, res) => {
    
});

export default router;