"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = require("../../models/user");
const users_tag_1 = require("../../models/users_tag");
const tag_1 = require("../../models/tag");
const like_1 = require("../../models/like");
const feed_1 = require("../../models/feed");
const tagFunc_1 = require("../func/tagFunc");
dotenv_1.default.config();
const userHandler = {
    bring: async (req, res, next) => {
        const { authorization } = req.headers;
        const { userId } = req.body;
        const userInfoFunc = async (param) => {
            const temp = await user_1.Users.findOne({ where: { id: param },
                include: [
                    {
                        model: users_tag_1.Users_tags,
                        as: 'userIdTag',
                        include: [
                            {
                                model: tag_1.Tags,
                                as: 'tagIdTag'
                            }
                        ]
                    },
                    {
                        model: feed_1.Feeds,
                        as: 'usersFeeds',
                        include: [
                            {
                                model: like_1.Likes,
                                as: 'feedsLikes'
                            }
                        ]
                    }
                ]
            }).then(d => {
                if (!d)
                    return res.status(404).json({ message: 'The user is not found' });
                else
                    return d;
            });
            const { id, nickName, introduction, userIdTag, usersFeeds, createdAt, updatedAt } = temp?.get();
            const tags = [];
            for (let i = 0; i < userIdTag.length; i += 1) {
                const { isUsed, tagId } = userIdTag[i];
                const { tagName, description } = userIdTag[i].tagIdTag;
                const tag = { tagId, tagName, description, isUsed };
                tags.push(tag);
            }
            ;
            let userLikeNum = 0;
            for (let i = 0; i < usersFeeds.length; i += 1) {
                userLikeNum += usersFeeds[i].feedsLikes.length;
            }
            ;
            const newCreatedAt = new Date(new Date(createdAt).setHours(new Date(createdAt).getHours() + 9));
            const newUpdatedAt = new Date(new Date(updatedAt).setHours(new Date(updatedAt).getHours() + 9));
            const userInfo = { userId: id, nickName, introduction, tags, userLikeNum, createdAt: newCreatedAt, updatedAt: newUpdatedAt };
            return userInfo;
        };
        if (!authorization && !userId)
            return res.status(401).json({ message: 'Unauthorized' });
        let userInfo = {};
        let popUp = [];
        if (userId) {
            userInfo = await userInfoFunc(userId);
            res.status(200).json({ data: { userInfo }, message: `User ${userId} info` });
        }
        else if (authorization) {
            const accessToken = authorization.split(' ')[1];
            const accTokenSecret = process.env.ACCTOKEN_SECRET || 'acctest';
            jsonwebtoken_1.default.verify(accessToken, accTokenSecret, async (err, decoded) => {
                if (err)
                    return res.status(401).json({ message: "Invalid token" });
                userInfo = await userInfoFunc(decoded.id);
                const isHundLikeGiven = await tagFunc_1.hundLike(decoded.id);
                if (isHundLikeGiven) {
                    popUp.push('좋아요 100개를 받아 대박사건 뱃지를 획득했습니다!');
                }
                res.status(200).json({ data: { userInfo }, message: 'cur user info', popUp });
            });
        }
    },
    edit: (req, res, next) => {
        const { authorization } = req.headers;
        const { avatarUrl, nickName, introduction } = req.body;
        if (!authorization)
            return res.status(401).json({ message: 'Unauthoriazed' });
        if (!avatarUrl || !nickName)
            return res.status(400).json({ message: 'Need accurate informations' });
        const accessToken = authorization.split(' ')[1];
        const accTokenSecret = process.env.ACCTOKEN_SECRET || 'acctest';
        jsonwebtoken_1.default.verify(accessToken, accTokenSecret, async (err, decoded) => {
            if (err)
                return res.status(400).json({ message: 'Invalid token' });
            const status = await user_1.Users.findOne({ where: { id: decoded.id }, attributes: ['status'] }).then(d => {
                return Number(d?.getDataValue('status'));
            });
            if (status === 3)
                return res.status(400).json({ message: "Banned user" });
            await user_1.Users.update({ avatarUrl, nickName, introduction }, { where: { id: decoded.id } }).then(d => {
                res.status(200).json({ edittedInfo: { nickName, introduction, avatarUrl }, message: 'Userinfo was edited' });
            });
        });
    },
    withdrawal: (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization)
            return res.status(401).json({ message: 'Unauthoriazed' });
        const accessToken = authorization.split(' ')[1];
        const accTokenSecret = process.env.ACCTOKEN_SECRET || 'acctest';
        jsonwebtoken_1.default.verify(accessToken, accTokenSecret, async (err, decoded) => {
            if (err)
                return res.status(400).json({ message: 'Invalid token' });
            await user_1.Users.destroy({ where: { id: decoded.id } }).then(d => res.status(200).json({ message: 'The user is removed in db' }));
        });
    }
};
exports.default = userHandler;
