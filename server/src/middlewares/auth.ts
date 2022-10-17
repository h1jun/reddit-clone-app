// 유저 정보나 유저의 등급에 따라서 인증을 하는 미들웨어
import { User } from "../entities/User";
import { Request, Response, NextFunction } from "express";

export default async (_: Request, res: Response, next: NextFunction) => {
  try {
    const user: User | undefined = res.locals.user;

    if (!user) throw new Error("Unauthenticated");

    return next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Unauthenticated" });
  }
};
