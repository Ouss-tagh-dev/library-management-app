const { PORT, DB_CONNECTION, DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } =
  process.env;

module.exports = {
  port: PORT || 8000,
  db_connection: DB_CONNECTION || "mysql",
  db_host: DB_HOST || "localhost",
  db_user: DB_USER || "root",
  db_password: DB_PASSWORD || "",
  db_name: DB_DATABASE || "db_books",
  db_port: DB_PORT || 3306,
};
