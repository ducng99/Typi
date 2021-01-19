import mysql from "mysql"
import NodeRSA from "node-rsa"
import express from "express"
import cors from "cors"
import fs from "fs"

var app = express();
app.use(cors({origin: ["https://ducng.dev", "https://chat.ducng.dev"]}));
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
        let sql = "INSERT INTO Users (Username, Password) VALUES (?, SHA2(?, 512))";
        con.query(sql, [req.body.username, req.body.password], function (err, result) {
            if (err)
            {
                if (err.code === "ER_DUP_ENTRY")
                {
                    res.send({status: false, msg: "User already exists!"});
                }
                else
                {
                    console.error(err);
                    res.send({status: false, msg: "MySQL query error! Admin check log"});
                }
            }
            else {
                res.send({status: true, msg: "Sucessfully registered user " + req.body.username + "!"});
                console.log("User " + req.body.username + " created.");
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
        
    }
    else
    {
        res.send({status: false, msg: "Username or password not valid!"});
    }
});

function CheckCredsValid(username, password)
{
    return (RegExp("(\\w|\\d){3,32}").test(username) && password.length >= 6);
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