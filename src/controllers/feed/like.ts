import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Feeds } from '../../models/feed';
import { Likes } from '../../models/like';
import { Users } from '../../models/user';
import { hundLike } from '../func/tagFunc';

//? 좋아요와 좋아요 취소 구현
const likeHandler = (req: Request, res:Response, next: NextFunction) => {
  const { authorization } = req.headers; //? 토큰확인
  if (!authorization) {
    res.status(401).json({message: 'unauthorized'}); //? 없다면 에러
  } else {
    const accessToken = authorization.split(' ')[1];
    const accTokenSecret = process.env.ACCTOKEN_SECRET || 'acctest'

    jwt.verify(accessToken, accTokenSecret, async (err: any, decoded: any ) => {
      if (err) {
        res.status(401).json({message: 'Invalid token'}); //? 토큰 만료
      } else {
        const feedId: number | null = Number(req.body.feedId) || null;
        if (!feedId) return res.status(400).json({message: 'Need accurate informaions'});
        const userId: number = Number(decoded.id);
        const status: number = await Users.findOne({where:{id: userId}, attributes: ['status']}).then(d => {
          return Number(d?.getDataValue('status'));
        });
        if (status === 3) return res.status(400).json({message: "Banned user"});
  
        //? 먼저 해당 유저가 해당 피드에대해 좋아요를 누른적이 있는지 찾는다.
        const isLiked:boolean = await Likes.findOne({where: {feedId, userId}}).then(d => {
          if (d) return true;
          else return false;
        });
        //? 있으면 좋아요 취소 -> 데이터베이스 삭제
        let message = '';
        let popUp: string | null = null;
        if (isLiked) {
          await Likes.destroy({where: {feedId, userId}}).then(d => {
            message = 'Dislike';
          })
        //? 없다면 데이터 베이스 생성
        } else {
          await Likes.create({feedId, userId}).then(async (d) => {
            const isGiven = await hundLike(feedId);
            if (isGiven) {
              popUp = '좋아요 100개를 받아 대박사건 뱃지를 획득 하셨습니다!'
            }
            message = 'Like';
          })
        }

        await Likes.count({where: {feedId}}).then( async (d) => {
          await Feeds.update({likeNum: d}, {where: {id: feedId}}).then(d => {
            res.status(200).json({message, popUp});
          });
        })
      }
    })
  }
};

export default likeHandler;