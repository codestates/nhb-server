"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feed_1 = require("../../models/feed");
const weekArray_1 = __importDefault(require("../func/weekArray"));
const apt = async (req, res, next) => {
    const { userId } = req.body;
    if (!userId)
        return res.status(400).json({ message: 'Need accurate informations' });
    const weekArr = weekArray_1.default().slice();
    const getFeeds = await feed_1.Feeds.findAll({ where: { userId }, attributes: ['createdAt'], raw: true }).then(d => {
        const obj = {};
        d.forEach(feed => {
            let { createdAt } = feed;
            const gap = parseInt(String((Number(new Date) - Number(createdAt)) / 1000 / 60 / 60 / 24));
            if (!obj[gap]) {
                obj[gap] = 1;
            }
            else {
                obj[gap] += 1;
            }
        });
        return obj;
    });
    const keys = Object.keys(getFeeds);
    const today = String(new Date(new Date().setHours(new Date().getHours() + 9)).toISOString().substr(0, 10));
    const dayOfDate = new Date(today).getDay();
    for (let i = 0; i < keys.length; i += 1) {
        let week = 51;
        let temp = dayOfDate - Number(keys[i]);
        while (temp < 0) {
            temp += 7;
            week -= 1;
        }
        weekArr[week][temp].feedNum = getFeeds[keys[i]];
    }
    ;
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
    res.status(200).json({ data: { apartment: weekArr }, message: 'Ok' });
};
exports.default = apt;
