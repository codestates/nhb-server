import { Feeds } from "../../models/feed";
import { Users_tags } from "../../models/users_tag"


export const hundLike = async (userId: number) => {
  const isExist = await Users_tags.findOne({where: {userId, tagId: 2}});
  if (isExist) return;
  const likeNum: number = await Feeds.sum('likeNum', {where: {userId}});
  if (Number(likeNum) < 100) return;
  if (userId) {
    await Users_tags.create({userId: Number(userId), tagId: 2, isUsed: 0});
    return true;
  }
}