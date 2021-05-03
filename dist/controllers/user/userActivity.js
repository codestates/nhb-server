"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comment_1 = require("../../models/comment");
const comments_like_1 = require("../../models/comments_like");
const like_1 = require("../../models/like");
const decodeToken_1 = require("../func/decodeToken");
const userActHandler = {
    like: async (req, res, next) => {
        const { userId, message } = await decodeToken_1.decodeToken(req);
        if (!userId)
            return res.status(401).json({ message });
        await like_1.Likes.findAll({ where: { userId }, attributes: ['feedId'], order: [['id', 'DESC']] }).then(d => {
            const likeAct = d.map(a => a.feedId);
            res.status(200).json({ data: { likeAct }, message: 'Ok' });
        });
    },
    comment: async (req, res, next) => {
        const { userId, message } = await decodeToken_1.decodeToken(req);
        if (!userId)
            return res.status(401).json({ message });
        await comment_1.Comments.findAll({ where: { userId }, attributes: ['feedId'], order: [['id', 'DESC']] }).then(d => {
            const cmtAct = d.map(a => a.feedId);
            res.status(200).json({ data: { cmtAct }, message: 'Ok' });
        });
    },
    cmtLike: async (req, res, next) => {
        const { userId, message } = await decodeToken_1.decodeToken(req);
        if (!userId)
            return res.status(401).json({ message });
        await comments_like_1.Comments_likes.findAll({ where: { userId }, attributes: ['commentId'], order: [['id', 'DESC']] }).then(d => {
            const cmtLikeAct = d.map(a => a.commentId);
            res.status(200).json({ data: { cmtLikeAct }, message: 'Ok' });
        });
    }
};
exports.default = userActHandler;
