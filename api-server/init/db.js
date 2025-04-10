const { Sequelize } = require("sequelize");

const {
  db_host,
  db_name,
  db_user,
  db_password,
  db_port,
  db_connection,
} = require("./../config/keys");

const sequelize = new Sequelize(db_name, db_user, db_password, {
  host: db_host,
  port: db_port,
  logging: false,
  dialect: db_connection,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    await sequelize.sync({ force: false });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = { sequelize, connectDB };
