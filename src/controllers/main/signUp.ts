import { Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { Users } from '../../models/user';
import { Users_tags } from '../../models/users_tag';
import { issueToken } from '../func/issueToken';

const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const { authCode } = req.body;
  const userInfo = await Users.findOne({where: {authCode}});
  //? authCode가 없다면 만료된 것이므로 다시 회원가입 인증 진행
  if (!userInfo) {
    res.status(401).json({"message": "Expired authcode"});
  } else {
    //? 만약 있다면
    const email = String(userInfo.getDataValue('email'));
    const nickName = String(userInfo.getDataValue('nickName'));
    const id = Number(userInfo.id)

    //? 코드가 일치하는 데이터 베이스의 스테이터스 코드 1(회원) 으로 바꾸고 코드 초기화 후
    //? 토큰 발급 후 전송
    await Users.update({authCode: null, status: 1}, {where: { id }}).then( async (data) => {
        const domain = process.env.COOKIE_DOMAIN || 'localhost';
        const accessToken = issueToken(true, '5h', id);
        const refreshToken = issueToken(false, '15d', id);
        await Users_tags.create({tagId: 1, userId: id, isUsed:0 });
      
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
        })
      }
    );
  };
};

export default signUp;