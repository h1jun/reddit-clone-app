import { NextFunction, Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";

const createSub = async (req: Request, res: Response, next: NextFunction) => {
  const { name, title, description } = req.body;

  // 유저 정보가 있다면 sub 이름과 제목이 이미 있는 것인지 체크

  // Sub Instance 생성 후 데이터베이스에 저장

  // 저장한 정보 프론트엔드로 전달해주기
};

const router = Router();
// 미들웨어 연결
// userMiddleware -> authMiddleware -> createSub 순으로 실행
router.post("/", userMiddleware, authMiddleware, createSub);

export default router;
