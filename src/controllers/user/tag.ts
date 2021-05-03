import { Request, Response, NextFunction } from 'express';
import { Tags } from '../../models/tag';
import { Users_tags } from '../../models/users_tag';
import { decodeToken } from '../func/decodeToken';

const tagHandler = {
  bring: async (req: Request, res: Response, next: NextFunction) => {
    const tags = await Tags.findAll({attributes: ['id', 'tagName', 'description', 'tagUrl'], raw: true});
    res.status(200).json({data: {tags}, message: 'All tags info'});
  },

  edit: async (req: Request, res: Response, next: NextFunction) => {
    const { userId, message } = await decodeToken(req);
    const { tagId } = req.body;
    if (!userId) return res.status(401).json({message});
    if (!tagId) return res.status(400).json({message: 'Need accurate informations'});
    const tagInfo = await Users_tags.findAll({where: { userId }, attributes: ['tagId', 'isUsed'], raw: true});
    let isAlreadyUsed = false;
    let usedTag: null | number = null;
    for (let i = 0; i < tagInfo.length; i += 1) {
      if (tagInfo[i].isUsed === 1) {
        usedTag = tagInfo[i].tagId;
        if (tagInfo[i].tagId === tagId) {
          isAlreadyUsed = true;
        }
        break;
      }
    };
    
    if (isAlreadyUsed) {
      //? 만약 이미 쓰는 뱃지를 눌렀다면 뱃지 표시 안하기
      await Users_tags.update({isUsed: 0}, {where: {userId, tagId}}).then(d => {
        res.status(200).json({data: {tagId: null}, message: "Detached tag"});
      });
    } else {
      //? 쓰는 뱃지가 아니라면 뱃지 교환 후 표시 하기
      await Users_tags.update({isUsed: 0}, {where: {userId, isUsed: 1}});
      await Users_tags.update({isUsed: 1}, {where: {userId, tagId}}).then(d => {
        res.status(200).json({data: {tagId}, message: `Changed tag ${usedTag} to ${tagId}`});
      });
    }

  }
}

export default tagHandler;