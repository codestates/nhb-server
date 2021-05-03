"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = require("../../models/user");
dotenv_1.default.config();
const decodeToken = async (req) => {
    const { authorization } = req.headers;
    if (!authorization)
        return { userId: null, message: 'Unauthorized' };
    const accessToken = authorization.split(' ')[1];
    const accTokenSecret = process.env.ACCTOKEN_SECRET || 'acctest';
    return await jsonwebtoken_1.default.verify(accessToken, accTokenSecret, async (err, decoded) => {
        if (err)
            return { userId: null, message: 'Invalid token' };
        const status = await user_1.Users.findOne({ where: { id: decoded.id }, attributes: ['status'] }).then(d => {
            return Number(d?.getDataValue('status'));
        });
        if (status === 3)
            return { userId: null, message: 'Banned user' };
        let isAdmin = status === 9 ? true : false;
        return { userId: decoded.id, message: null, isAdmin };
    });
};
exports.decodeToken = decodeToken;
