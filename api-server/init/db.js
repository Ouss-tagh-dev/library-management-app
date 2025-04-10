const mysql = require("mysql2");
const {
  db_host,
  db_user,
  db_password,
  db_name,
  db_port,
} = require("./../config/keys");

const connection = mysql.createConnection({
  host: db_host,
  user: db_user,
  password: db_password,
  database: db_name,
  port: db_port,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");
});

module.exports = connection;
