const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define("users", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true },
  number: { type: DataTypes.INTEGER, defaultValue:'0' },
  password: { type: DataTypes.STRING },
  level: { type: DataTypes.INTEGER, defaultValue: '0'},
  exp: { type: DataTypes.INTEGER, defaultValue: '0' },
  avatar: { type: DataTypes.STRING, defaultValue: 'userNoImage.png'},
  role: { type: DataTypes.STRING, defaultValue: "USER" },
});

const Friend = sequelize.define("friends", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
})

const Map = sequelize.define('maps', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  description: { type: DataTypes.STRING },
  phase: { type: DataTypes.INTEGER },
  image: { type: DataTypes.STRING },
  difficult: { type: DataTypes.STRING },
})

const Like = sequelize.define('likes', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
})

const UserMapPlayed = sequelize.define('userMapPlayed', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  score: { type: DataTypes.INTEGER, defaultValue: '0'}
})

const VariantMap = sequelize.define('variantMap', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  image: { type: DataTypes.STRING },
  posX: { type: DataTypes.INTEGER },
  posY: { type: DataTypes.INTEGER },
})

User.hasMany(Friend)
Friend.belongsTo(User)

User.hasMany(UserMapPlayed)
UserMapPlayed.belongsTo(User)

Map.hasMany(Like)
Like.belongsTo(Map)

Map.hasMany(UserMapPlayed)
UserMapPlayed.belongsTo(Map)

Map.hasMany(VariantMap)
VariantMap.belongsTo(Map)

module.exports = {
  User, Friend, Map, Like, UserMapPlayed, VariantMap
};
