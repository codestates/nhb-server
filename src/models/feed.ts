import {
  Association,
  DataTypes, 
  Model, 
} from 'sequelize';
import { sequelize } from './index';
import { Users } from './user';
import { Topics } from './topic';

interface FeedsAttributes {
  id?: number,
  content: string,
  likeNum?: number,
  commentNum?: number,
  topicId: number,
  userId: number
  createdAt?: Date,
};

export class Feeds extends Model <FeedsAttributes> {
  public readonly id!: number;
  public content!: string;
  public topicId!: number;
  public userId!: number;
  public createdAt!: Date;

  public static associations: {
    usersFeeds: Association<Users, Feeds>;
    topicsFeeds: Association<Topics, Feeds>;
  };
};

Feeds.init(
  {
    likeNum: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },    
    commentNum: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    modelName: 'Feeds',
    tableName: 'feeds',
    sequelize,
    freezeTableName: true,
  }
)

Users.hasMany(Feeds, {
  sourceKey : "id",
  foreignKey : "userId",
  as: 'usersFeeds'
});

Feeds.belongsTo(Users, {
  foreignKey: 'userId',
  as: 'usersFeeds'
});

Topics.hasMany(Feeds, {
  sourceKey: 'id',
  foreignKey: 'topicId',
  as: 'topicsFeeds'
});

Feeds.belongsTo(Topics, {
  foreignKey: 'topicId',
  as: 'topicsFeeds'
})
