import { Request, Response, Router } from "express";

// req 객체 안에는 client에서 보내주는 데이터가 들어있다.
// client에서 넘어온 요청을 받고 res로 client에게 보내줄 수 있다.
const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  console.log("email, username, password : ", email, username, password);
};

// /register 경로로 post요청으로 올 때는 register라는 핸들러를 이용
const router = Router();
router.post("/register", register); // /api/auth/register로 요청이 오면 register 핸들러 실행

export default router;
