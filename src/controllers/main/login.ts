import { Request, Response, NextFunction} from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { Users } from '../../models/user';
import { issueToken } from '../func/issueToken';

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { authCode } = req.body;
  const userInfo = await Users.findOne({where: {authCode}});
  //? authCode가 없다면 만료된 것이므로 다시 로그인 인증 진행
  if (!userInfo) {
    res.status(401).json({"message": "Expired authcode"});
  } else {
    //? 토큰 발급하는 함수
    const id = Number(userInfo.id);
    const status = Number(userInfo.getDataValue('status'));

    if (status === 3) return res.status(400).json({message: "Banned user"});

    //? 코드 초기화 -> 토큰 발급 후 전송
    await Users.update({ authCode: null }, {where: { id }}).then(async (data) => {
       const domain = process.env.COOKIE_DOMAIN || 'localhost';
       const accessToken = await issueToken(true, '5h', id, status);
       const refreshToken = await issueToken(false, '15d', id, status);
       interface ResMessage {
         data: {accessToken: string, isAdmin?: boolean};
         message: string
       }
       let resMessage: ResMessage = {data: {accessToken: accessToken}, message: "Login"}; 
       if (status === 9) {
         resMessage = {data: {accessToken: accessToken, isAdmin: true}, message: "Admin accessed"};
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
        .json(resMessage)
      }
    );
  }
}

export default login;