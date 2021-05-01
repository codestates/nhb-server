"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("./user"));
const liveRank_1 = __importDefault(require("./liveRank"));
const userActivity_1 = __importDefault(require("./userActivity"));
const tag_1 = __importDefault(require("./tag"));
const apartment_1 = __importDefault(require("./apartment"));
module.exports = {
    bring: user_1.default.bring,
    edit: user_1.default.edit,
    withdrawal: user_1.default.withdrawal,
    liveRank: liveRank_1.default,
    like: userActivity_1.default.like,
    comment: userActivity_1.default.comment,
    cmtLike: userActivity_1.default.cmtLike,
    tagBring: tag_1.default.bring,
    tagEdit: tag_1.default.edit,
    apt: apartment_1.default
};
