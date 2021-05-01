"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const user_1 = require("../../models/user");
const issueToken_1 = require("../func/issueToken");
const login = async (req, res, next) => {
    const { authCode } = req.body;
    const userInfo = await user_1.Users.findOne({ where: { authCode } });
    //? authCode가 없다면 만료된 것이므로 다시 로그인 인증 진행
    if (!userInfo) {
        res.status(401).json({ "message": "Expired authcode" });
    }
    else {
        //? 토큰 발급하는 함수
        const id = Number(userInfo.id);
        const status = Number(userInfo.getDataValue('status'));
        if (status === 3)
            return res.status(400).json({ message: "Banned user" });
        //? 코드 초기화 -> 토큰 발급 후 전송
        await user_1.Users.update({ authCode: null }, { where: { id } }).then(async (data) => {
            const domain = process.env.COOKIE_DOMAIN || 'localhost';
            const accessToken = await issueToken_1.issueToken(true, '5h', id, status);
            const refreshToken = await issueToken_1.issueToken(false, '15d', id, status);
            let resMessage = { data: { accessToken: accessToken }, message: "Login" };
            if (status === 9) {
                resMessage = { data: { accessToken: accessToken, isAdmin: true }, message: "Admin accessed" };
            }
            //? document.cookie 방지, secure-> https만 가능, path -> path 제한, domain -> subdomain
            res.status(200)
                .cookie('refreshToken', refreshToken, {
                domain,
                path: '/main',
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
                .json(resMessage);
        });
    }
};
exports.default = login;
