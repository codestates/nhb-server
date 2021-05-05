import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Users } from '../../models/user';
dotenv.config();

export const decodeToken = async (req: Request): Promise<any> => {
  const { authorization } = req.headers;
  if (!authorization) return { userId: null, message: 'Unauthorized' };
  const accessToken = authorization.split(' ')[1];
  const accTokenSecret = process.env.ACCTOKEN_SECRET || 'acctest'; 
  return await jwt.verify(accessToken, accTokenSecret, async (err, decoded: any) => {
    if (err) return { userId: null, message: 'Invalid token' };
    const status: number = await Users.findOne({where:{id: decoded.id}, attributes: ['status']}).then(d => {
      return Number(d?.getDataValue('status'));
    });
    
    if (status === 3) return { userId: null, message: 'Banned user' };
    let isAdmin = status === 9 ? true : false;
    
    return { userId: decoded.id, message: null, isAdmin };
  })
}