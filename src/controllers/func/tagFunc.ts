import Sequelize from 'sequelize';
import { Feeds } from "../../models/feed";
import { Users_tags } from "../../models/users_tag"


export const hundLike = async (feedId: number) => {
  const userId = await Feeds.findOne({where:{id: feedId}, raw: true, attributes: ['userId']}).then(d => {
    if (d) return Number(d.userId);
  }).catch(e => 'hundLike err');
  const isExist = await Users_tags.findOne({where: {userId, tagId: 2}});
  if (isExist) return;
  const likeNum: number = await Feeds.sum('likeNum', {where: {userId}});
  if (Number(likeNum) < 100) return;
  if (userId) {
    await Users_tags.create({userId: Number(userId), tagId: 2, isUsed: 0});
    return true;
  }
}