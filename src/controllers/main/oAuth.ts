import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import util from 'util';
dotenv.config();
import { OAuths } from '../../models/oauth';
import { Users } from '../../models/user';
import { Users_tags } from '../../models/users_tag';
import { issueToken } from '../func/issueToken';

const oAuthHandler = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization;
  const randByte = util.promisify(crypto.randomBytes);
  const pbkdf2 = util.promisify(crypto.pbkdf2);
  //? google oauth를 통해 정보를 받아온다
  if (!accessToken) return res.status(401).json({message: 'unauthorized'});
  const oAuthData = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo?access_token=' + accessToken, { 
    headers: { 
      authorization: `token ${accessToken}`, 
      accept: 'application/json' 
    }})
    .then(data => {
      return data.data;
  }).catch(e => console.log('oAuth token expired'));

  //? 받아온 정보의 email과 고유 id로 식별
  const { email, id } = oAuthData;

  const salt: any = await randByte(64).then(d => d.toString('base64')).catch(e => {console.log('hashingerror')});
  const hashedId = await pbkdf2(id, salt, 100000, 64, 'sha512').then(d => d.toString('base64')).catch(e => {console.log('hashingerror')});

  const userInfo: any = await Users.findOne({where: {email}, raw: true});
  let oAuthInfo = null;
  let status: number | null = null;
  if (userInfo) {
    status = Number(userInfo.status);
    oAuthInfo = await OAuths.findOne({where: {userId: userInfo.id}, raw: true});
  }
  
  const domain = process.env.COOKIE_DOMAIN || 'localhost';

  let issuedAccessToken, refreshToken, message: string = '';
  //? oauth id와 email로 된 user가 존재하지 않을 경우 회원가입
  if (!oAuthInfo && !userInfo && hashedId) {
    const nickName: string = '시인' + Math.random().toString(36).slice(2);
    await Users.create({email, nickName, introduction: null, avatarUrl: null, authCode: null, status: 1}).then( async (d) => {
      await OAuths.create({userId: d.id, oAuthId: hashedId, platform: 'google', salt});
      await Users_tags.create({tagId: 1, userId: d.id, isUsed:0 });
      issuedAccessToken = await issueToken(true, '5h', d.id);
      refreshToken = await issueToken(false, '14d', d.id);
      message = 'Sign up';
    });
  };

  //? email의 회원 정보만 존재할 경우 oauth랑 연동
  if (userInfo && !oAuthInfo && hashedId) {
    await OAuths.create({userId: userInfo.id, oAuthId: hashedId, platform: 'google', salt});
    issuedAccessToken = await issueToken(true, '5h', userInfo.id, status);
    refreshToken = await issueToken(false, '14d', userInfo.id, status);
    message = 'Login';
  }
  
  //? 둘 다 존재할 경우 로그인
  if (userInfo && oAuthInfo) {
    const { userId, oAuthId } = oAuthInfo;
    const savedSalt = oAuthInfo.salt;
    if (userId !== userInfo.id) return res.status(401).json({message: 'unauthorized'});
    const decodedId = await pbkdf2(id, savedSalt, 100000, 64, 'sha512').then(d => d.toString('base64')).catch(e => {console.log('hashingerror')});
    if (decodedId !== oAuthId) return res.status(401).json({message: 'unauthorized'});
    issuedAccessToken = await issueToken(true, '5h', userId, status);
    refreshToken = await issueToken(false, '14d', userId, status);
    message = 'Login';
  };

  interface ResMessage {
    data: {accessToken: string, isAdmin?: boolean};
    message: string
  };

  if (!issuedAccessToken) return console.log('token issue error');
  let resMessage: ResMessage = {data: {accessToken: issuedAccessToken}, message: message};
  if (Number(status) === 9) {
    resMessage = {data: {accessToken: issuedAccessToken, isAdmin: true}, message: "Admin accessed"};
  };

  res.status(200)
  .cookie('refreshToken', refreshToken, {
    domain,
    path: '/main',
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  })
  .json(resMessage);
}

export default oAuthHandler;