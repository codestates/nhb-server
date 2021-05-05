import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const issueToken = async (isAcc: boolean ,expiresIn: string, id: number, status?: number | null) => {
  let secret: string = process.env.ACCTOKEN_SECRET || 'acctest';
  if (!isAcc) {
    secret = process.env.REFTOKEN_SECRET || 'reftest';
  };

  if (status === 9) return await jwt.sign({ id, status }, secret, { expiresIn: '3h' });
  else return await jwt.sign({ id }, secret, { expiresIn });
};