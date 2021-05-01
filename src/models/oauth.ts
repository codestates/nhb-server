import {
  Association,
  DataTypes, 
  Model, 
} from 'sequelize';
import {sequelize} from './index';
import { Users } from './user';

interface OauthsAttributes {
  platform : string;
  oAuthId : string;
  userId : number;
  salt: string;
  userIdOauth?: any;
};

export class OAuths extends Model <OauthsAttributes> {
  public readonly id!: number;
  public platform!: string;
  public oAuthId!: string;
  public userId!: number;
  public salt!: string;
  public userIdOauth!: any;

  public static associations: {
    userIdOauth: Association<Users, OAuths>;
  };
};

OAuths.init(
  {
    platform: {
      type: DataTypes.STRING,
      allowNull: false
    },
    oAuthId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    modelName: 'OAuths',
    tableName: 'oauths',
    sequelize,
    freezeTableName: true,
  }
)

Users.hasMany(OAuths, {
  sourceKey : "id",
  foreignKey : "userId",
  as: 'userIdOauth'
});

OAuths.belongsTo(Users, {
  foreignKey: 'userId',
  as: 'userIdOauth'
})
