import { NextFunction, Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { isEmpty } from "class-validator";
import { AppDataSource } from "../data-source";
import Sub from "../entities/Sub";
import { User } from "../entities/User";
import Post from "../entities/Post";
import { unlinkSync } from "fs";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import { makeid } from "../utils/helpers";

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

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });

    if (sub.username !== user.username) {
      return res
        .status(403)
        .json({ error: "이 커뮤니티를 소유하고 있지 않습니다." });
    }

    res.locals.sub = sub;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: "public/images",
    filename: (_, file, callback) => {
      const name = makeid(10);
      callback(null, name + path.extname(file.originalname));
    },
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true);
    } else {
      callback(new Error("이미지가 아닙니다."));
    }
  },
});

const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;
  try {
    const type = req.body.type;
    // 파일 유형을 지정치 않았을 시에는 업로든 된 파일 삭제
    if (type !== "image" && type !== "banner") {
      if (!req.file?.path) {
        return res.status(400).json({ error: "유효하지 않은 파일" });
      }

      // multer에 의해 캡슐화된 파일 객체에는 파일 경로가 있기 때문에
      // dirname/pwd가 자동으로 추가됩니다.
      // 파일을 지워주기
      unlinkSync(req.file.path);
      return res.status(400).json({ error: "잘못된 유형" });
    }

    let oldImageUrn: string = "";

    // 이미지가 등록되어 있는데 새로운 이미지 등록 시 이전 이미지 삭제하는 로직
    if (type === "image") {
      // 사용중인 Urn 을 저장합니다. (이전 파일을 아래서 삭제하기 위해서)
      oldImageUrn = sub.imageUrn || "";
      // 새로운 파일 이름을 Urn 으로 넣어줍니다.
      sub.imageUrn = req.file?.filename || "";
    } else if (type === "banner") {
      oldImageUrn = sub.bannerUrn || "";
      sub.bannerUrn = req.file?.filename || "";
    }
    await sub.save(); // 이미지 이름 저장

    // 사용하지 않는 이미지 파일 삭제
    if (oldImageUrn !== "") {
      // 데이터베이스는 파일 이름일 뿐이므로 개체 경로 접두사를 직접 추가해야한다.
      // Linux 및 Windows와 호환
      const fullFilename = path.resolve(
        process.cwd(),
        "public",
        "images",
        oldImageUrn
      );
      unlinkSync(fullFilename);
    }

    return res.json(sub);
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
router.post(
  "/:name/upload",
  userMiddleware,
  authMiddleware,
  ownSub,
  upload.single("file"),
  uploadSubImage
);

export default router;
