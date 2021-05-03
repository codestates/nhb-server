"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = require("../../models/user");
dotenv_1.default.config();
// const memoAuthCode: string[] = []; //? 코드 중복 검사용
const authEmail = async (req, res, next) => {
    const { email } = req.body;
    const vaildCheck = email.indexOf('@');
    if (!email || email.length === 0 || vaildCheck === -1) {
        return res.status(400).json({ message: 'Need accurate informations' });
    }
    ;
    //? 랜덤 코드 생성 겹칠일이 없을거란 생각. 만약 겹친다면 memoization으로 검사.
    // const issueAuthCode = (): string => {
    //   const temp: string = String(Math.random().toString(36).slice(2));
    //   const valid: number = Number(memoAuthCode.indexOf(temp));
    //   if (valid === -1) {
    //     memoAuthCode.push(temp);
    //     setTimeout(() => {
    //       memoAuthCode.shift();
    //     }, 60 * 60 * 1000);
    //     return temp;
    //   } else {
    //     return issueAuthCode();
    //   }
    // }
    let authCode = String(Math.random().toString(36).slice(2)); //? 랜덤 문자열 생성
    let action = '';
    let endPoint = '';
    let display = '';
    //? 만약 이미 존재하는 유저라면 로그인 폼으로 아니라면 회원가입 폼으로.
    const isUser = await user_1.Users.findOne({ where: { email } }).then(async (data) => {
        if (data) {
            //? 존재하지만 회원가입이 완료 되지 않았을 떄 status code는 0
            const status = Number(data.getDataValue('status'));
            //? 0일 때 다시한번 authCode를 갱신하여 회원가입 이메일을 보내고
            if (status === 0) {
                await user_1.Users.update({ authCode }, { where: { email } });
                //? 1시간이 지나도 회원가입 완료하지 않을 시 자동으로 데이터베이스 파괴
                setTimeout(async () => {
                    await user_1.Users.findOne({ where: { authCode } }).then(async (data) => {
                        if (data) {
                            const status = Number(data.getDataValue('status'));
                            const email = String(data.getDataValue('email'));
                            if (status === 0) {
                                await user_1.Users.destroy({ where: { email } });
                            }
                        }
                    });
                }, 60 * 60 * 1000);
                action = '회원가입';
                endPoint = 'signup';
                return false;
            }
            else {
                await user_1.Users.update({ authCode }, { where: { email } });
                //? 로그인 으로 진행할 때 1시간 후 자동으로 authCode -> null.
                setTimeout(async () => {
                    await user_1.Users.update({ authCode: null }, { where: { email } });
                }, 60 * 60 * 1000);
                action = '로그인';
                endPoint = 'login';
                display = 'none';
                return true;
            }
        }
        else {
            //? 데이터베이스에 정보가 없을 때
            const nickName = '시인' + Math.random().toString(36).slice(2);
            //? 회원가입 전 임시 데이터 베이스를 만들어 준다. 
            //? 만약 링크를 누른다면 signUp 메소드에서 status -> 1(회원).
            await user_1.Users.create({ email, nickName, introduction: null, authCode, status: 0, avatarUrl: null });
            //? 1시간 안에 완료하지 않을 시 데이터베이스 자체를 파괴.
            setTimeout(async () => {
                await user_1.Users.findOne({ where: { authCode } }).then(async (data) => {
                    if (data) {
                        const status = Number(data.getDataValue('status'));
                        const email = String(data.getDataValue('email'));
                        if (status === 0) {
                            await user_1.Users.destroy({ where: { email } });
                        }
                    }
                });
            }, 60 * 60 * 1000);
            action = '회원가입';
            endPoint = 'signup';
            return false;
        }
    });
    // //? ejs를 이용한 인증이메일 폼.
    // let authEmailForm;
    // //? 리다이렉선을 하고싶다면 .env 에서 수정
    // const clientAddr: string = process.env.CLIENT_ADDR || 'https://localhost:3000'
    // ejs.renderFile(__dirname + '/authForm/authMail.ejs', { clientAddr, authCode, action, endPoint, display }, (err, data) => {
    //   if (err) console.log(err);
    //   authEmailForm = data;
    // })
    // //? 메일을 보내는 코드. 각 플렛폼에서 권한 설정부터!
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   host: 'smtp.gmail.com',
    //   port: 587,
    //   secure: false,
    //   auth: {
    //       user: process.env.NODEMAILER_USER,
    //       pass: process.env.NODEMAILER_PASSWD,
    //   },
    // });
    // await transporter.sendMail({
    //   from: `BBBA <tkdfo93@gmail.com>`,
    //   to: email,
    //   subject: isUser ? 'NHB에 로그인을 완료해주세요!' : 'NHB의 회원이 되어주세요!',
    //   html: authEmailForm,
    // }, (error, info) => {
    //   if (error) {
    //     console.log(error);
    //   }
    //   res.status(200).json({"message": action});
    //   transporter.close();
    // });
    res.send(authCode);
};
exports.default = authEmail;
