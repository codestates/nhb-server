"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const blacklist_1 = require("../../models/blacklist");
dotenv_1.default.config();
const logout = async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
        return res.status(401).json({ message: 'unauthorized' });
    await blacklist_1.BlackLists.create({ refreshToken }).then(d => {
        res.clearCookie('refreshToken', { path: '/main' }).status(200).json({ message: 'Logout' });
    });
};
exports.default = logout;
