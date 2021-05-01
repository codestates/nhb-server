"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authEmail_1 = __importDefault(require("./authEmail"));
const signUp_1 = __importDefault(require("./signUp"));
const login_1 = __importDefault(require("./login"));
const refreshtoken_1 = __importDefault(require("./refreshtoken"));
const logout_1 = __importDefault(require("./logout"));
const oAuth_1 = __importDefault(require("./oAuth"));
// TODO: 이메일인증/ 회원가입/ 로그인/ OAuth 등 메인 관련 메소드를 파일로 나누어 따로 만든 후 임포트
module.exports = {
    authEmail: authEmail_1.default,
    signUp: signUp_1.default,
    login: login_1.default,
    refreshToken: refreshtoken_1.default,
    logout: logout_1.default,
    oAuthHandler: oAuth_1.default
};
