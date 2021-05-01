import { Request, Response, NextFunction } from 'express';
import { Likes } from '../../models/like';
import { Tags } from '../../models/tag';
import { Users } from '../../models/user';
import { Users_tags } from '../../models/users_tag';

const rank = async (req: Request, res: Response, next: NextFunction) => {
  //? 먼저 모든 유저에 대한 좋아요, 뱃지 관련 데이터를 가지고 온다.
  const data = await Users.findAll({
    attributes:['id', 'nickName'],
    include: [
      {
        model: Likes,
        as: 'usersLikes'
      },
      {
        model: Users_tags,
        as: 'userIdTag',
        include: [
          {
            model: Tags,
            as: 'tagIdTag',
          }
        ]
      }
    ],
  });

  //? 조회가 끝나면 라이크 순으로 정렬
  const sortedData: Users[] = data.sort((a: Users, b: Users): any => {
    const el1 = a.get().usersLikes?.length;
    const el2 = b.get().usersLikes?.length;
    if (el1 !== undefined && el2 !== undefined) {
      if (el1 > el2) return -1;
      else if (el1 < el2) return 1;
      else return 0
    } else {
      console.log('something wrong in rank system');
    };
  });
  //? 원하는 만큼 슬라이싱 두번째 인자를 변수로 두고 
  //? 요청시 body에 원하는 수 만큼 주면 변경 가능하게 할 수 있다.
  const slicedData = sortedData.slice(0, 10);

  //? 조회가 끝났으면
  const rank: {}[] = [];
  //? 밑의 알고리즘 대로 분류 한다.
  for (let i = 0; i < slicedData.length; i += 1) {
    interface Rankinfo {
      userId: number | undefined;
      nickName: string;
      likeNum: number;
      tag: number | null;
    }
    //? 필요한 데이터를 뽑아온다.
    const { id, nickName, usersLikes, userIdTag } = slicedData[i].get();
    //? 사용중인 태그만 뽑아오기.
    const tempTag: any = userIdTag?.filter((a: Users_tags) => a.isUsed === 1)[0];
    //? 만약 사용중인 태그가 없으면 null 값을 준다.
    let tag = null;
    if (tempTag !== undefined) {
      tag = tempTag.tagIdTag.dataValues.id;
    };

    //? 형식대로 정리해서 rank에 담은 후 보내기
    if (usersLikes !== undefined) {
      const tempRank: Rankinfo = {userId: id, nickName, likeNum: usersLikes?.length, tag};
      rank.push(tempRank);
    } else {
      console.log('something wrong in rank system');
    };
  };

  res.status(200).json({data: {rank}, message: 'Rank 1 to 10'});
};

export default rank;