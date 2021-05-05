"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = __importDefault(require("sequelize"));
dotenv_1.default.config();
const topic_1 = require("../../models/topic");
const feed_1 = require("../../models/feed");
const user_1 = require("../../models/user");
const users_tag_1 = require("../../models/users_tag");
const tag_1 = require("../../models/tag");
const decodeToken_1 = require("../func/decodeToken");
const feedHandler = {
    //? 피드 업로드 핸들러
    upload: async (req, res, next) => {
        const { userId, message } = await decodeToken_1.decodeToken(req);
        if (!userId)
            return res.status(401).json({ message });
        //? 바디에 담긴 콘텐트를 갖고와서 데이터베이스에 삽입
        const { word, content } = req.body;
        if (!word || content instanceof Array === false) {
            return res.status(400).json({ message: 'Need accurate informaions' });
        }
        ;
        const strContent = JSON.stringify(content);
        const topic = await topic_1.Topics.findOne({ where: { word } });
        if (!topic) {
            res.status(404).json({ message: 'The topic is not fonud' });
        }
        else {
            const topicId = topic.getDataValue('id');
            await feed_1.Feeds.create({ content: strContent, topicId, userId }).then(d => {
                res.status(201).json({ message: 'The feed is uploaded' });
            });
        }
    },
    //? 피드 가저오기
    bring: async (req, res, next) => {
        const Op = sequelize_1.default.Op;
        const { topicId, isMaxLike, limit, userId, feedId } = req.body;
        if (!limit)
            return res.status(400).json({ message: 'Need accurate informaions' });
        const startFeedId = feedId ? await feed_1.Feeds.max('id', { where: { id: { [Op.lt]: feedId } } }).then(d => {
            if (!d)
                return -1;
            return d;
        }) : await feed_1.Feeds.max('id'); //? 계속탐색
        if (startFeedId === -1)
            return res.status(200).json({ data: { userFeeds: [] }, message: 'ok' });
        let where = { id: { [Op.lte]: startFeedId } };
        let order = [['id', 'DESC']];
        if (userId) {
            where['userId'] = Number(userId);
        }
        ;
        if (isMaxLike) {
            order = [['likeNum', 'DESC']];
        }
        ;
        if (topicId) {
            where['topicId'] = Number(topicId);
        }
        ;
        const temp = await feed_1.Feeds.findAll({ order: order, limit: limit,
            where: where,
            include: [
                {
                    model: user_1.Users,
                    as: 'usersFeeds',
                    attributes: ['id', 'nickName'],
                    include: [
                        {
                            model: users_tag_1.Users_tags,
                            as: 'userIdTag',
                            attributes: ['isUsed'],
                            include: [
                                {
                                    model: tag_1.Tags,
                                    as: 'tagIdTag',
                                    attributes: ['id']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: topic_1.Topics,
                    as: 'topicsFeeds',
                    attributes: ['word']
                },
            ],
            attributes: ['id', 'content', 'likeNum', 'commentNum', 'createdAt', 'updatedAt'] })
            .catch(e => { console.log('get feeds error'); });
        const userFeeds = [];
        if (temp === undefined)
            return res.status(200).json({ data: { userFeeds }, message: 'All feeds' });
        for (let i = 0; i < temp.length; i += 1) {
            const { id, content, likeNum, commentNum, usersFeeds, topicsFeeds, createdAt, updatedAt } = temp[i];
            let tag = null;
            if (usersFeeds.userIdTag) {
                for (let i = 0; i < usersFeeds.userIdTag.length; i += 1) {
                    if (usersFeeds.userIdTag[i].isUsed === 1) {
                        tag = usersFeeds.userIdTag[i].tagIdTag.id;
                        break;
                    }
                }
            }
            const user = { userId: usersFeeds.id, nickName: usersFeeds.nickName, tag };
            const newCreatedAt = new Date(new Date(createdAt).setHours(new Date(createdAt).getHours() + 9));
            const newUpdatedAt = new Date(new Date(updatedAt).setHours(new Date(updatedAt).getHours() + 9));
            const userFeed = { feedId: id, user, topic: topicsFeeds.word, content: JSON.parse(content), likeNum, commentNum, createdAt: newCreatedAt, updatedAt: newUpdatedAt };
            userFeeds.push(userFeed);
        }
        res.status(200).json({ data: { userFeeds }, message: 'All feeds' });
    },
    //? 피드 삭제 핸들러
    remove: async (req, res, next) => {
        let { userId, message, isAdmin } = await decodeToken_1.decodeToken(req);
        if (!userId)
            return res.status(401).json({ message });
        const { feedId } = req.body;
        if (!feedId)
            return res.status(400).json({ message: 'Need accurate informaions' });
        //? admin 처리
        let where = { id: feedId, userId };
        message = `The feed ${feedId} is removed`;
        if (isAdmin) {
            where = { id: feedId };
            message = 'admin: ' + message;
        }
        ;
        //? 모든 유효성 검사를 통과 후 삭제
        await feed_1.Feeds.destroy({ where }).then(d => {
            if (d === 0)
                return res.status(404).json({ message: 'The feedId does not match with userId' });
            res.status(200).json({ message });
        })
            .catch(e => {
            console.log('delete feed error');
        });
    },
    //? 피드 에디트
    edit: async (req, res, next) => {
        let { userId, message, isAdmin } = await decodeToken_1.decodeToken(req);
        if (!userId)
            return res.status(401).json({ message });
        const { content, feedId } = req.body;
        if (!content || !feedId || content instanceof Array === false)
            return res.status(400).json({ message: 'Need accurate informaion' });
        //? 모든 유효성 검사 후 수정.
        let where = { id: feedId, userId };
        message = `The feed ${feedId} is edited`;
        if (isAdmin) {
            where = { id: feedId };
            message = 'admin: ' + message;
        }
        ;
        await feed_1.Feeds.update({ content: JSON.stringify(content) }, { where }).then(d => {
            if (d[0] === 0)
                return res.status(404).json({ message: 'The feedId does not match with userId' });
            res.status(200).json({ message });
        }).catch(e => {
            console.log('edit feed error');
        });
    }
};
exports.default = feedHandler;
