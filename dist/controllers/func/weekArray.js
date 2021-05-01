"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const arrFunc = () => {
    const arr = [];
    for (let i = 0; i < 52; i += 1) {
        arr.push([]);
        for (let j = 0; j < 7; j += 1) {
            arr[i].push({ date: null, feedNum: null });
        }
    }
    ;
    let d = 0;
    let week = 51;
    const today = new Date(new Date().setHours(new Date().getHours() + 9)).toISOString().substr(0, 10);
    const todayStr = String(today);
    while (week !== -1) {
        const dayOfDate = new Date(new Date(todayStr).setDate(new Date(todayStr).getDate() - d)).getDay();
        arr[week][dayOfDate].date = new Date(new Date(todayStr).setDate(new Date(todayStr).getDate() - d)).toISOString().substr(0, 10);
        if (dayOfDate === 0) {
            week -= 1;
        }
        d += 1;
    }
    return arr;
};
exports.default = arrFunc;
