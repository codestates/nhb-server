import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { BlackLists } from '../../models/blacklist';
dotenv.config();

const logout = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({message: 'unauthorized'});
  await BlackLists.create({refreshToken}).then(d => {
    res.clearCookie('refreshToken', {path: '/main'}).status(200).json({message:'Logout'});
  });
}

export default logout;