"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const issueToken = async (isAcc, expiresIn, id, status) => {
    let secret = process.env.ACCTOKEN_SECRET || 'acctest';
    if (!isAcc) {
        secret = process.env.REFTOKEN_SECRET || 'reftest';
    }
    ;
    if (status === 9)
        return await jsonwebtoken_1.default.sign({ id, status }, secret, { expiresIn: '3h' });
    else
        return await jsonwebtoken_1.default.sign({ id }, secret, { expiresIn });
};
exports.issueToken = issueToken;
