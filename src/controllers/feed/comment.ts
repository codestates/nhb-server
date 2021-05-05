import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Comments } from '../../models/comment';
import { Comments_likes } from '../../models/comments_like';
import { Feeds } from '../../models/feed';
import { Users } from '../../models/user';
import { decodeToken } from '../func/decodeToken';

const commentHandler = {
  //? 코멘트 업로드
  upload: async (req: Request, res: Response, next: NextFunction) => {
    const { feedId, comment } = req.body;
    if (!feedId || !comment) return res.status(400).json({message: 'Need accurate informaions'});

    const { userId, message } = await decodeToken(req);
    if (!userId) return res.status(401).json({message});
    //? 유효성 검사 후 업로드
    await Comments.create({comment, feedId, userId})
    .then( async (d) => {
      await Comments.count({where: {feedId}}).then( async (d) => {
        await Feeds.update({commentNum: d}, {where: {id: feedId}}).then(d => {
          res.status(201).json({message: "The comment is uploaded"});
        });
      })
    })
    .catch(e => {
      console.log('comment upload error');
    })
  },
  //? 코멘트 좋아요 기능 피드 좋아요 기능과 작동 방식 같음.
  like: async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.body;
    if (!commentId) return res.status(400).json({message: 'Need accurate informaions'});

    const { userId, message } = await decodeToken(req);
    if (!userId) return res.status(401).json({message});
      
    await Comments.findOne({where: {id: commentId}}).then((d:any) => {
      if (!d) return res.status(404).json({message: 'The comment does not exist'})
    });

    const isLike = await Comments_likes.findOne({where:{commentId, userId}}).then(d => {
      if (d) return true;
      else return false;
    });

    if (isLike) {
      await Comments_likes.destroy({where: {commentId, userId}}).then(d => {
        res.status(200).json({messasge: 'Comment dislike'});
      }).catch(d => console.log('comment dislike error'));
    } else {
      await Comments_likes.create({commentId, userId}).then(d => {
        res.status(201).json({message: 'Comment like'});
      }).catch(d => console.log('comment like error'));
    };
  },

  //? 코멘트 삭제 방식은 피드 삭제 방식과 같음.
  remove: async (req: Request, res: Response, next: NextFunction) => {
    const { commentId, feedId } = req.body;

    if (!commentId || !feedId) return res.status(400).json({message: 'Need accurate informaions'});

    let { userId, message, isAdmin } = await decodeToken(req);
    if (!userId) return res.status(401).json({message});

    let where: {id: number, userId?: number, feedId: number} = {id: commentId, userId, feedId};

    message = `The comment ${commentId} is removed`;

    if (isAdmin) {
      where = {id: commentId, feedId};
      message = 'admin: ' + message;
    }
    
    await Comments.destroy({where}).then(async (d) => {
      if (d === 0) return res.status(404).json({message: 'The commentId does not match with userId'});
      await Comments.count({where: {feedId}}).then( async (d) => {
        await Feeds.update({commentNum: d}, {where: {id: feedId}}).then(d => {
          res.status(200).json({message});
        })
      });
    }).catch(e => console.log('remove comment error'));
  },
  //? 코멘트 수정 피드 수정과 같은 방식
  edit: async (req: Request, res: Response, next: NextFunction) => {
    const { comment, commentId } = req.body;

    if (!commentId || !comment) return res.status(400).json({message: 'Need accurate informaions'});
    
    let { userId, message, isAdmin } = await decodeToken(req);
    if (!userId) return res.status(401).json({message});

    let where: {id: number, userId?: number} = {id: commentId, userId};
    message = `The coment ${commentId} is edited`;

    if (isAdmin) {
      where = {id: commentId};
      message = 'admin: ' + message;
    }
    
    await Comments.update({comment}, {where})
    .then(d => {
      if(d[0] === 0) return res.status(404).json({message: 'The commentId does not match with userId'})
      res.status(200).json({message});
    })
    .catch(e => console.log('edit comment error'));
  },

  //? 피드 아이디에 따른 코멘트 조회. 피드 조회와 같은 알고리즘
  bring: async (req: Request, res: Response, next: NextFunction) => {
    const { feedId } = req.body;
    if (!feedId) return res.status(400).json({message: 'Need accurate informaions'});
    const data: any = await Comments.findAll({
      where: {feedId},
      include: [
        {
          model: Comments_likes,
          as: 'cmtLikesCommentId'
        },
        {
          model: Users,
          as: 'commentsUserId'
        }
      ]
    }).catch(e => console.log('comment search error'));

    interface Cmt {
      user: {nickName: string, userId: number};
      commentId: number;
      comment: string | null;
      commentLike: number | null;
      createdAt: Date,
      updatedAt: Date
    }
    const comments: {}[] = [];
    for (let i = 0; i < data.length; i += 1) {
      const { id, comment, createdAt, updatedAt, cmtLikesCommentId, commentsUserId } = data[i].get();
      const newCreatedAt = new Date(new Date(createdAt).setHours(new Date(createdAt).getHours() + 9));
      const newUpdatedAt = new Date(new Date(updatedAt).setHours(new Date(updatedAt).getHours() + 9));
      const cmt: Cmt = {
        user: {nickName: commentsUserId.nickName, userId: commentsUserId.id},
        commentId: id,
        comment,
        commentLike: cmtLikesCommentId.length,
        createdAt: newCreatedAt,
        updatedAt: newUpdatedAt,
      };

      comments.push(cmt);
    };

    res.status(200).json({data: {comments}, message: `Feed ${feedId}\`s comments` });
  }
}

export default commentHandler;