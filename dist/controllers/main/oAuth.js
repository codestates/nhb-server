"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const util_1 = __importDefault(require("util"));
dotenv_1.default.config();
const oauth_1 = require("../../models/oauth");
const user_1 = require("../../models/user");
const users_tag_1 = require("../../models/users_tag");
const issueToken_1 = require("../func/issueToken");
const oAuthHandler = async (req, res, next) => {
    const accessToken = req.headers.authorization;
    const randByte = util_1.default.promisify(crypto_1.default.randomBytes);
    const pbkdf2 = util_1.default.promisify(crypto_1.default.pbkdf2);
    //? google oauth를 통해 정보를 받아온다
    if (!accessToken)
        return res.status(401).json({ message: 'unauthorized' });
    const oAuthData = await axios_1.default.get('https://www.googleapis.com/oauth2/v2/userinfo?access_token=' + accessToken, {
        headers: {
            authorization: `token ${accessToken}`,
            accept: 'application/json'
        }
    })
        .then(data => {
        return data.data;
    }).catch(e => console.log('oAuth token expired'));
    //? 받아온 정보의 email과 고유 id로 식별
    const { email, id } = oAuthData;
    const salt = await randByte(64).then(d => d.toString('base64')).catch(e => { console.log('hashingerror'); });
    const hashedId = await pbkdf2(id, salt, 100000, 64, 'sha512').then(d => d.toString('base64')).catch(e => { console.log('hashingerror'); });
    const userInfo = await user_1.Users.findOne({ where: { email }, raw: true });
    let oAuthInfo = null;
    let status = null;
    if (userInfo) {
        status = Number(userInfo.status);
        oAuthInfo = await oauth_1.OAuths.findOne({ where: { userId: userInfo.id }, raw: true });
    }
    const domain = process.env.COOKIE_DOMAIN || 'localhost';
    let issuedAccessToken, refreshToken, message = '';
    //? oauth id와 email로 된 user가 존재하지 않을 경우 회원가입
    if (!oAuthInfo && !userInfo && hashedId) {
        const nickName = '시인' + Math.random().toString(36).slice(2);
        await user_1.Users.create({ email, nickName, introduction: null, avatarUrl: null, authCode: null, status: 1 }).then(async (d) => {
            await oauth_1.OAuths.create({ userId: d.id, oAuthId: hashedId, platform: 'google', salt });
            await users_tag_1.Users_tags.create({ tagId: 1, userId: d.id, isUsed: 0 });
            issuedAccessToken = await issueToken_1.issueToken(true, '5h', d.id);
            refreshToken = await issueToken_1.issueToken(false, '14d', d.id);
            message = 'Sign up';
        });
    }
    ;
    //? email의 회원 정보만 존재할 경우 oauth랑 연동
    if (userInfo && !oAuthInfo && hashedId) {
        await oauth_1.OAuths.create({ userId: userInfo.id, oAuthId: hashedId, platform: 'google', salt });
        issuedAccessToken = await issueToken_1.issueToken(true, '5h', userInfo.id, status);
        refreshToken = await issueToken_1.issueToken(false, '14d', userInfo.id, status);
        message = 'Login';
    }
    //? 둘 다 존재할 경우 로그인
    if (userInfo && oAuthInfo) {
        const { userId, oAuthId } = oAuthInfo;
        const savedSalt = oAuthInfo.salt;
        if (userId !== userInfo.id)
            return res.status(401).json({ message: 'unauthorized' });
        const decodedId = await pbkdf2(id, savedSalt, 100000, 64, 'sha512').then(d => d.toString('base64')).catch(e => { console.log('hashingerror'); });
        if (decodedId !== oAuthId)
            return res.status(401).json({ message: 'unauthorized' });
        issuedAccessToken = await issueToken_1.issueToken(true, '5h', userId, status);
        refreshToken = await issueToken_1.issueToken(false, '14d', userId, status);
        message = 'Login';
    }
    ;
    ;
    if (!issuedAccessToken)
        return console.log('token issue error');
    let resMessage = { data: { accessToken: issuedAccessToken }, message: message };
    if (Number(status) === 9) {
        resMessage = { data: { accessToken: issuedAccessToken, isAdmin: true }, message: "Admin accessed" };
    }
    ;
    res.status(200)
        .cookie('refreshToken', refreshToken, {
        domain,
        path: '/main',
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    })
        .json(resMessage);
};
exports.default = oAuthHandler;
