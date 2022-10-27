import { NextFunction, Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { isEmpty } from "class-validator";
import { AppDataSource } from "../data-source";
import Sub from "../entities/Sub";
import { User } from "../entities/User";
import Post from "../entities/Post";

const getSub = async (req: Request, res: Response) => {
  const name: string = req.params.name;

  try {
    const sub = await Sub.findOneByOrFail({ name }); // findOneOrFail는 하나를 찾거나 faile이 되거나

    // 포스트를 생성한 후에 해당 sub에 속하는 포스트 정보들을 넣어주기

    return res.json(sub);
  } catch (error) {
    return res.status(404).json({ error: "커뮤니티를 찾을 수 없습니다." });
  }
};
const createSub = async (req: Request, res: Response, next: NextFunction) => {
  const { name, title, description } = req.body;

  try {
    let errors: any = {};
    // FE에게 전달해줄 에러 메세지
    if (isEmpty(name)) errors.name = "이름은 비워둘 수 없습니다.";
    if (isEmpty(title)) errors.title = "제목은 비워둘 수 없습니다.";

    // 유저 정보가 있다면 sub 이름과 제목이 이미 있는 것인지 DB에서체크
    const sub = await AppDataSource.getRepository(Sub)
      .createQueryBuilder("sub")
      .where("lower(sub.name) = :name", { name: name.toLowerCase() })
      .getOne(); // 같은 이름의 커뮤니티는 하나만 있어야 되기 때문에 getOne()

    if (sub) errors.name = "서브가 이미 존재합니다"; // 같은 이름의 sub가 존재하는 경우

    // 에러가 있다면 errors 던지기
    if (Object.keys(errors).length > 0) {
      throw new errors();
    }
  } catch (error) {
    return res.status(500).json({ error: "문제가 발생했습니다" });
  }

  try {
    const user: User = res.locals.user;

    // Sub Instance 생성 후 데이터베이스에 저장
    const sub = new Sub();
    sub.name = name;
    sub.description = description;
    sub.title = title;
    sub.user = user;

    await sub.save();

    // 저장한 정보 프론트엔드로 전달해주기
    return res.json(sub);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다" });
  }

  // 저장한 정보 프론트엔드로 전달해주기
};

const topSubs = async (req: Request, res: Response) => {
  console.log("진입2");
  // 쿼리 날려주는 부분
  try {
    const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' ||s."imageUrn",'https://www.gravatar.com/avatar?d=mp&f=y')`;
    const subs = await AppDataSource.createQueryBuilder()
      .select(
        `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
      )
      .from(Sub, "s")
      .leftJoin(Post, "p", `s.name = p."subName"`)
      .groupBy('s.title, s.name, "imageUrl"')
      .orderBy(`"postCount"`, "DESC")
      .limit(5)
      .execute();
    return res.json(subs); // FE 전달
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

const router = Router();
// 미들웨어 연결
// userMiddleware -> authMiddleware -> createSub 순으로 실행
router.get("/:name", userMiddleware, authMiddleware, getSub);
router.post("/", userMiddleware, authMiddleware, createSub);
router.get("/sub/topSubs", topSubs);

export default router;
