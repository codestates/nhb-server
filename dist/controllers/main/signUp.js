"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const user_1 = require("../../models/user");
const users_tag_1 = require("../../models/users_tag");
const issueToken_1 = require("../func/issueToken");
const signUp = async (req, res, next) => {
    const { authCode } = req.body;
    const userInfo = await user_1.Users.findOne({ where: { authCode } });
    //? authCode가 없다면 만료된 것이므로 다시 회원가입 인증 진행
    if (!userInfo) {
        res.status(401).json({ "message": "Expired authcode" });
    }
    else {
        //? 만약 있다면
        const email = String(userInfo.getDataValue('email'));
        const nickName = String(userInfo.getDataValue('nickName'));
        const id = Number(userInfo.id);
        //? 코드가 일치하는 데이터 베이스의 스테이터스 코드 1(회원) 으로 바꾸고 코드 초기화 후
        //? 토큰 발급 후 전송
        await user_1.Users.update({ authCode: null, status: 1 }, { where: { id } }).then(async (data) => {
            const domain = process.env.COOKIE_DOMAIN || 'localhost';
            const accessToken = issueToken_1.issueToken(true, '5h', id);
            const refreshToken = issueToken_1.issueToken(false, '15d', id);
            await users_tag_1.Users_tags.create({ tagId: 1, userId: id, isUsed: 0 });
            res.status(200)
                .cookie('refreshToken', refreshToken, {
                domain,
                path: '/main',
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
                .json({
                "data": {
                    "accessToken": accessToken,
                    "email": email,
                    "nickName": nickName
                },
                "message": "Sign up"
            });
        });
    }
    ;
};
exports.default = signUp;
