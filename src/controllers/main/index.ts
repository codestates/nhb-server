import authEmail from './authEmail';
import signUp from './signUp';
import login from './login';
import refreshToken from './refreshtoken';
import logout from './logout';
import oAuthHandler from './oAuth';

// TODO: 이메일인증/ 회원가입/ 로그인/ OAuth 등 메인 관련 메소드를 파일로 나누어 따로 만든 후 임포트
module.exports = {
  authEmail,
  signUp,
  login,
  refreshToken,
  logout,
  oAuthHandler
}