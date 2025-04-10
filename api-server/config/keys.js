const {
  PORT,
  DB_CONNECTION,
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_PORT,
} = process.env;

module.exports = {
  port: PORT,
  db_connection: DB_CONNECTION,
  db_host: DB_HOST,
  db_user: DB_USERNAME,
  db_password: DB_PASSWORD,
  db_name: DB_DATABASE,
  db_port: DB_PORT,
};
