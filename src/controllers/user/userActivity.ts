import { Request, Response, NextFunction } from 'express';
import { Comments } from '../../models/comment';
import { Comments_likes } from '../../models/comments_like';
import { Likes } from '../../models/like';
import { decodeToken } from '../func/decodeToken';

const userActHandler = {
  like: async (req: Request, res: Response, next: NextFunction) => {
    const { userId, message } = await decodeToken(req);
    if (!userId) return res.status(401).json({message});

    await Likes.findAll({where: {userId}, attributes: ['feedId'], order: [['id', 'DESC']]}).then(d => {
      const likeAct = d.map(a => a.feedId);
      res.status(200).json({data: { likeAct }, message: 'Ok'});
    });
  },

  comment: async (req: Request, res: Response, next: NextFunction) => {
    const { userId, message } = await decodeToken(req);
    if (!userId) return res.status(401).json({message});
  
    await Comments.findAll({where: {userId}, attributes: ['feedId'], order: [['id', 'DESC']]}).then(d => {
      const cmtAct = d.map(a => a.feedId);
      res.status(200).json({data: { cmtAct }, message: 'Ok'});
    })
  },

  cmtLike: async (req: Request, res: Response, next: NextFunction) => {
    const { userId, message } = await decodeToken(req);
    if (!userId) return res.status(401).json({message});

    await Comments_likes.findAll({where: {userId}, attributes: ['commentId'], order: [['id', 'DESC']]}).then(d => {
      const cmtLikeAct = d.map(a => a.commentId);
      res.status(200).json({data: { cmtLikeAct }, message: 'Ok'});
    })
  }
};

export default userActHandler;