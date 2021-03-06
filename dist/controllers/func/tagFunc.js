"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hundLike = void 0;
const feed_1 = require("../../models/feed");
const users_tag_1 = require("../../models/users_tag");
const hundLike = async (userId) => {
    const isExist = await users_tag_1.Users_tags.findOne({ where: { userId, tagId: 2 } });
    if (isExist)
        return;
    const likeNum = await feed_1.Feeds.sum('likeNum', { where: { userId } });
    if (Number(likeNum) < 100)
        return;
    if (userId) {
        await users_tag_1.Users_tags.create({ userId: Number(userId), tagId: 2, isUsed: 0 });
        return true;
    }
};
exports.hundLike = hundLike;
