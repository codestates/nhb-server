import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { Users } from '../../models/user';
import { BlackLists } from '../../models/blacklist';

const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;
  //? 헤더 내 쿠키에 리프레시 토큰이 없을 때
  if (!refreshToken) {
    res.status(401).json({message: "Unauthorized"});
  } else {
    //? 있을 때 디코딩
    const isBlocked = await BlackLists.findOne({where:{refreshToken}}).then(d => {
      if (d) return true;
      else return false;
    });

    if (isBlocked) return res.status(401).json({message: 'Blocked reftoken'});
    
    const accTokenSecret = process.env.ACCTOKEN_SECRET || 'acctest';
    await jwt.verify(refreshToken, accTokenSecret, async (err: any, decoded: any) => {
      //? 토큰이 만료 되었을 때
      if (err) {
        res.status(401).json({messsage: "Invalid token"});
      } else {
        //? 토큰이 만료되지 않았을 때 액세스 토큰 재발급
        const userInfo = await Users.findOne({where: {id: decoded.id}});
        if (!userInfo) {
          res.status(404).json({message: "User is not found"});
        } else {
          const accessToken = await jwt.sign({id: userInfo.id}, accTokenSecret, { expiresIn: '5h'});
          res.status(200).json({"data": {"accessToken": accessToken}, "message": "New accesstoken is issued"});
        }
      }
    })
  }
}

export default refreshToken;