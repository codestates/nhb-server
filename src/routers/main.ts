import { Router } from 'express';
const { authEmail, signUp, login, refreshToken, logout, oAuthHandler } = require('../controllers/main');

const router = Router();

router.post('/authemail', authEmail);
router.post('/signup', signUp);
router.post('/login', login);
router.get('/refreshtoken', refreshToken);
router.get('/logout', logout);
router.get('/oauth', oAuthHandler);

export default router;