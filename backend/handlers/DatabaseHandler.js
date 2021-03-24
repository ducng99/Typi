import mysql from "mysql"
import fs from "fs"
import path from "path"

const mysql_creds = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "mysql-creds.json")));

var con = mysql.createPool({
    host: "localhost",
    user: mysql_creds.username,
    password: mysql_creds.password,
    database: "Typi"
});

export default con;