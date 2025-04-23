const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../init/db");
const User = require("./User");
const Book = require("./Book");

const Loan = sequelize.define(
  "Loan",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Books",
        key: "id",
      },
    },
    loan_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    return_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

Loan.belongsTo(User, { foreignKey: "user_id" });
Loan.belongsTo(Book, { foreignKey: "book_id" });

module.exports = Loan;
