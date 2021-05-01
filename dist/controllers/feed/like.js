"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const feed_1 = require("../../models/feed");
const like_1 = require("../../models/like");
const user_1 = require("../../models/user");
const tagFunc_1 = require("../func/tagFunc");
//? 좋아요와 좋아요 취소 구현
const likeHandler = (req, res, next) => {
    const { authorization } = req.headers; //? 토큰확인
    if (!authorization) {
        res.status(401).json({ message: 'unauthorized' }); //? 없다면 에러
    }
    else {
        const accessToken = authorization.split(' ')[1];
        const accTokenSecret = process.env.ACCTOKEN_SECRET || 'acctest';
        jsonwebtoken_1.default.verify(accessToken, accTokenSecret, async (err, decoded) => {
            if (err) {
                res.status(401).json({ message: 'Invalid token' }); //? 토큰 만료
            }
            else {
                const feedId = Number(req.body.feedId) || null;
                if (!feedId)
                    return res.status(400).json({ message: 'Need accurate informaions' });
                const userId = Number(decoded.id);
                const status = await user_1.Users.findOne({ where: { id: userId }, attributes: ['status'] }).then(d => {
                    return Number(d?.getDataValue('status'));
                });
                if (status === 3)
                    return res.status(400).json({ message: "Banned user" });
                //? 먼저 해당 유저가 해당 피드에대해 좋아요를 누른적이 있는지 찾는다.
                const isLiked = await like_1.Likes.findOne({ where: { feedId, userId } }).then(d => {
                    if (d)
                        return true;
                    else
                        return false;
                });
                //? 있으면 좋아요 취소 -> 데이터베이스 삭제
                let message = '';
                let popUp = null;
                if (isLiked) {
                    await like_1.Likes.destroy({ where: { feedId, userId } }).then(d => {
                        message = 'Dislike';
                    });
                    //? 없다면 데이터 베이스 생성
                }
                else {
                    await like_1.Likes.create({ feedId, userId }).then(async (d) => {
                        message = 'Like';
                    });
                }
                await like_1.Likes.count({ where: { feedId } }).then(async (d) => {
                    await feed_1.Feeds.update({ likeNum: d }, { where: { id: feedId } }).then(async (d) => {
                        const isGiven = await tagFunc_1.hundLike(feedId);
                        if (isGiven) {
                            popUp = '좋아요 100개를 받아 대박사건 뱃지를 획득 하셨습니다!';
                        }
                        ;
                        res.status(200).json({ message, popUp });
                    });
                });
            }
        });
    }
};
exports.default = likeHandler;
