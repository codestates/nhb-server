"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuths = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
const user_1 = require("./user");
;
class OAuths extends sequelize_1.Model {
}
exports.OAuths = OAuths;
;
OAuths.init({
    platform: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    oAuthId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    salt: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
}, {
    modelName: 'OAuths',
    tableName: 'oauths',
    sequelize: index_1.sequelize,
    freezeTableName: true,
});
user_1.Users.hasMany(OAuths, {
    sourceKey: "id",
    foreignKey: "userId",
    as: 'userIdOauth'
});
OAuths.belongsTo(user_1.Users, {
    foreignKey: 'userId',
    as: 'userIdOauth'
});
