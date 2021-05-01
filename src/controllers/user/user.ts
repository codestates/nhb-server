import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Users } from '../../models/user';
import { Users_tags } from '../../models/users_tag';
import { Tags } from '../../models/tag';
import { Likes } from '../../models/like';
import { Feeds } from '../../models/feed';
dotenv.config();

const userHandler = {
  bring: async (req: Request, res:Response, next: NextFunction) => {
    const { authorization } = req.headers;
    const { userId } = req.body;
    const userInfoFunc = async (param: number) => {
      const temp:any = await Users.findOne({where: {id: param}, 
        include: [
          {
            model: Users_tags,
            as: 'userIdTag',
            include: [
              {
                model: Tags,
                as: 'tagIdTag'
              }
            ]
          },
          {
            model: Feeds,
            as: 'usersFeeds',
            include: [
              {
                model: Likes,
                as: 'feedsLikes'
              }
            ]
          }
        ]
      }).then(d => {
        if (!d) return res.status(404).json({message: 'The user is not found'});
        else return d;
      });

      const { id, nickName, introduction, userIdTag, usersFeeds, createdAt, updatedAt } = temp?.get();
      const tags = [];
      for (let i = 0; i < userIdTag.length; i += 1) {
        const { isUsed, tagId } = userIdTag[i];
        const { tagName, description } = userIdTag[i].tagIdTag;
        const tag = { tagId, tagName, description, isUsed };
        tags.push(tag);
      };

      let userLikeNum: number = 0; 
      for (let i = 0; i < usersFeeds.length; i += 1) {
        userLikeNum += usersFeeds[i].feedsLikes.length;
      };

      const newCreatedAt = new Date(new Date(createdAt).setHours(new Date(createdAt).getHours() + 9));
      const newUpdatedAt = new Date(new Date(updatedAt).setHours(new Date(updatedAt).getHours() + 9));

      const userInfo = {userId: id, nickName, introduction, tags, userLikeNum, createdAt: newCreatedAt, updatedAt: newUpdatedAt};
      return userInfo;
    };


    if (!authorization && !userId) return res.status(401).json({message: 'Unauthorized'});
    let userInfo: {} = {};
    if (userId) {
      userInfo = await userInfoFunc(userId);
      res.status(200).json({data: {userInfo}, message: `User ${userId} info`});
    } else if (authorization) {
      const accessToken = authorization.split(' ')[1];
      const accTokenSecret = process.env.ACCTOKEN_SECRET || 'acctest';
      jwt.verify(accessToken, accTokenSecret, async (err, decoded: any) => {
        if (err) return res.status(401).json({message: "Invalid token"});
        userInfo = await userInfoFunc(decoded.id);
        res.status(200).json({data: {userInfo}, message: 'cur user info'});
      });
    }
  },

  edit: (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    const { avatarUrl, nickName, introduction } = req.body;
    if (!authorization) return res.status(401).json({message: 'Unauthoriazed'});
    if (!avatarUrl || !nickName) return res.status(400).json({message: 'Need accurate informations'});

    const accessToken = authorization.split(' ')[1];
    const accTokenSecret = process.env.ACCTOKEN_SECRET || 'acctest';
     jwt.verify(accessToken, accTokenSecret, async (err, decoded: any) => {
       if (err) return res.status(400).json({message: 'Invalid token'});

       const status: number = await Users.findOne({where:{id: decoded.id}, attributes: ['status']}).then(d => {
        return Number(d?.getDataValue('status'));
      });
      if (status === 3) return res.status(400).json({message: "Banned user"});


       await Users.update({ avatarUrl, nickName, introduction }, { where: {id: decoded.id} }).then(d => {
         res.status(200).json({edittedInfo: { nickName, introduction, avatarUrl },message: 'Userinfo was edited'});
       });
     });
  },

  withdrawal: (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).json({message: 'Unauthoriazed'});

    const accessToken = authorization.split(' ')[1];
    const accTokenSecret = process.env.ACCTOKEN_SECRET || 'acctest';
    jwt.verify(accessToken, accTokenSecret, async (err, decoded: any) => {
      if (err) return res.status(400).json({message: 'Invalid token'});
      await Users.destroy({where: {id: decoded.id}}).then(d => res.status(200).json({message: 'The user is removed in db'}));
    });
  }
};

export default userHandler;