import { Request, Response, Router } from "express";
import useMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import Sub from "../entities/Sub";
import Post from "../entities/Post";

const createPost = async (req: Request, res: Response) => {
  const { title, body, sub } = req.body;

  if (title.trim() === "") {
    return res.status(400).json({ title: "제목은 비워둘 수 없습니다" });
  }

  const user = res.locals.user;

  // DB 작업
  try {
    const subRecord = await Sub.findOneByOrFail({ name: sub });

    const post = new Post();
    post.title = title;
    post.body = body;
    post.user = user;
    post.sub = subRecord;

    await post.save();

    return res.json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

const router = Router();
router.post("/", useMiddleware, authMiddleware, createPost);

export default router;
