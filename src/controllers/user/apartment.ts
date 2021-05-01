import e, { Request, Response, NextFunction } from 'express';
import { Feeds } from '../../models/feed';
import arrFunc from '../func/weekArray';

const apt = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({message: 'Need accurate informations'});
  const weekArr = arrFunc().slice();
  const getFeeds = await Feeds.findAll({where: {userId}, attributes: ['createdAt'], raw: true}).then(d => {
    const obj: any = {};

    d.forEach(feed => {
      let { createdAt } = feed;
      const gap = parseInt(String((Number(new Date) - Number(createdAt))/ 1000 / 60 / 60 / 24));
      if (!obj[gap]) {
        obj[gap] = 1;
      } else {
        obj[gap] += 1;
      }
    });

    return obj;
  });
  
  const keys = Object.keys(getFeeds);
  const today = String(new Date(new Date().setHours(new Date().getHours() + 9)).toISOString().substr(0, 10));
  const dayOfDate = new Date(today).getDay();

  for (let i = 0; i < keys.length ; i += 1) {
    let week = 51
    let temp = dayOfDate - Number(keys[i]);
    while (temp < 0) {
      temp += 7;
      week -= 1;
    }
    weekArr[week][temp].feedNum = getFeeds[keys[i]];
  };

  //? 3중 for문을 이용한 가장 간단한 방식
  // for (let i = 0; i < getFeeds.length; i += 1) {
  //   for (let j = 0; j < weekArr.length; j += 1) {
  //     for (let k = 0; k < weekArr[j].length; k += 1) {
  //       if (getFeeds[i].createdAt.toISOString().substr(0, 10) === weekArr[j][k].date) {
  //         weekArr[j][k].feedNum += 1;
  //       }
  //     }
  //   }
  // }

  res.status(200).json({data: {apartment: weekArr}, message: 'Ok'});
}

export default apt;