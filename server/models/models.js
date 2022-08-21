const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define("users", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true },
  number: { type: DataTypes.INTEGER, defaultValue:'0' },
  password: { type: DataTypes.STRING },
  exp: { type: DataTypes.INTEGER, defaultValue: '0' },
  gamesPlayed: { type: DataTypes.INTEGER, defaultValue: '0' },
  avgGameScore: { type: DataTypes.INTEGER, defaultValue: '0' },
  avatar: { type: DataTypes.STRING, defaultValue: 'userNoImage.png'},
  role: { type: DataTypes.STRING, defaultValue: "USER" },
});

const Friend = sequelize.define("friends", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  friendId: { type: DataTypes.INTEGER}
})

User.hasMany(Friend)
Friend.belongsTo(User)

module.exports = {
  User, Friend
};
