import mysql from "mysql"
import fs from "fs"

const mysql_creds = JSON.parse(fs.readFileSync("../../mysql-creds.json"));

var con = mysql.createPool({
    host: "localhost",
    user: mysql_creds.username,
    password: mysql_creds.password,
    database: "Typi"
});

export default con;