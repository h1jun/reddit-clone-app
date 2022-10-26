import { isEmpty, validate } from "class-validator";
import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";

import useMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";

const mapErrors = (errors: Object[]) => {
  return errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  }, {});
};

// req 객체 안에는 client에서 보내주는 데이터가 들어있다.
// client에서 넘어온 요청을 받고 res로 client에게 보내줄 수 있다.
const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    let errors: any = {};

    // 이메일과 유저이름이 이미 저장 사용되고 있는 것인지 확인
    const emailUser = await User.findOneBy({ email });
    const usernameUser = await User.findOneBy({ username });

    // 이미 있다면 errors 객체어 넣어줌
    if (emailUser) errors.email = "이미 해당 이메일 주소가 사용되었습니다";
    if (usernameUser) errors.username = "이미 이 사용자 이름이 사용되었습니다";

    // 에러가 있다면 return으로 에러를 response로 보내줌
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // 등록된 정보가 없다면 유저 정보와 함께 user 인스턴스를 생성
    const user = new User(); // 인스턴드 생성
    user.email = email;
    user.username = username;
    user.password = password;

    // 엔티티에 정해놓은 조건으로 user 데이터의 유효성 검사를 해줌
    errors = await validate(user);

    if (errors.length > 0) return res.status(300).json(mapErrors(errors));

    // 유저 정보를 user table에 저장, BaseEntity에서 가져온 것
    await user.save();

    // 저장된 유저 정보를 response로 보내줌
    return res.json(user);
  } catch (error) {
    console.log(error);
    // 에러를 responser로 보내줌
    return res.status(500).json({ error });
  }
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // 에러 담는 객체
    let errors: any = {};

    // 비워졌다면 에러를 프론트엔드로 보내주기
    if (isEmpty(username))
      errors.username = "사용자 이름은 비워둘 수 없습니다.";
    if (isEmpty(password)) errors.password = "비밀번호는 비워둘 수 없습니다.";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // DB에서 유저 찾기
    const user = await User.findOneBy({ username });

    // 유저가 없다면 에러 보내기
    if (!user) {
      return res
        .status(404)
        .json({ username: "사용자 이름이 등록되지 않습니다." });
    }

    // 유저가 있다면 비밀번호 비교하기
    const passwordMatches = await bcrypt.compare(password, user.password);

    // 비밀번호가 다르다면 에러 보내기
    if (!passwordMatches) {
      return res.status(404).json({ password: "비밀번호가 잘못되었습니다." });
    }

    // 비밀번호가 맞다면 토큰 생성
    const token = jwt.sign({ username }, process.env.JWT_SECRET!);

    // 쿠키 저장
    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })
    );

    return res.json({ user, token });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const me = async (_: Request, res: Response) => {
  // _를 사용하는 이유는 req를 사용하지 않을 때 _로 대체
  return res.json(res.locals.user);
};

const logout = async (_: Request, res: Response) => {
  res.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    })
  );
  res.status(200).json({ success: true });
};

// /register 경로로 post요청으로 올 때는 register라는 핸들러를 이용
const router = Router();
router.get("/me", useMiddleware, authMiddleware, me); // 미들웨어 거쳐서 문제 없으면 me 핸들러로 이동
router.post("/register", register); // /api/auth/register로 요청이 오면 register 핸들러 실행
router.post("/login", login);
router.post("/logout", useMiddleware, authMiddleware, logout);
export default router;
