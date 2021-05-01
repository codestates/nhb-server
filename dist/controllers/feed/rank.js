"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const like_1 = require("../../models/like");
const tag_1 = require("../../models/tag");
const user_1 = require("../../models/user");
const users_tag_1 = require("../../models/users_tag");
const rank = async (req, res, next) => {
    //? 먼저 모든 유저에 대한 좋아요, 뱃지 관련 데이터를 가지고 온다.
    const data = await user_1.Users.findAll({
        attributes: ['id', 'nickName'],
        include: [
            {
                model: like_1.Likes,
                as: 'usersLikes'
            },
            {
                model: users_tag_1.Users_tags,
                as: 'userIdTag',
                include: [
                    {
                        model: tag_1.Tags,
                        as: 'tagIdTag',
                    }
                ]
            }
        ],
    });
    //? 조회가 끝나면 라이크 순으로 정렬
    const sortedData = data.sort((a, b) => {
        const el1 = a.get().usersLikes?.length;
        const el2 = b.get().usersLikes?.length;
        if (el1 !== undefined && el2 !== undefined) {
            if (el1 > el2)
                return -1;
            else if (el1 < el2)
                return 1;
            else
                return 0;
        }
        else {
            console.log('something wrong in rank system');
        }
        ;
    });
    //? 원하는 만큼 슬라이싱 두번째 인자를 변수로 두고 
    //? 요청시 body에 원하는 수 만큼 주면 변경 가능하게 할 수 있다.
    const slicedData = sortedData.slice(0, 10);
    //? 조회가 끝났으면
    const rank = [];
    //? 밑의 알고리즘 대로 분류 한다.
    for (let i = 0; i < slicedData.length; i += 1) {
        //? 필요한 데이터를 뽑아온다.
        const { id, nickName, usersLikes, userIdTag } = slicedData[i].get();
        //? 사용중인 태그만 뽑아오기.
        const tempTag = userIdTag?.filter((a) => a.isUsed === 1)[0];
        //? 만약 사용중인 태그가 없으면 null 값을 준다.
        let tag = null;
        if (tempTag !== undefined) {
            tag = tempTag.tagIdTag.dataValues.id;
        }
        ;
        //? 형식대로 정리해서 rank에 담은 후 보내기
        if (usersLikes !== undefined) {
            const tempRank = { userId: id, nickName, likeNum: usersLikes?.length, tag };
            rank.push(tempRank);
        }
        else {
            console.log('something wrong in rank system');
        }
        ;
    }
    ;
    res.status(200).json({ data: { rank }, message: 'Rank 1 to 10' });
};
exports.default = rank;
