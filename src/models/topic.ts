import {
  DataTypes, 
  Model, 
} from 'sequelize';
import { sequelize } from './index';

interface TopicsAttributes {
  id?: number,
  word: string,
};

export class Topics extends Model <TopicsAttributes> {
  public readonly id!: number;
  public word!: string;

  public static associations: {
  };
};

Topics.init(
  {
    word: {
      type: DataTypes.STRING,
      allowNull: false
    },
  },
  {
    modelName: 'Topics',
    tableName: 'topics',
    sequelize,
    freezeTableName: true,
  }
);