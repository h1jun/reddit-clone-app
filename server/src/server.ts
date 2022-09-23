import { AppDataSource } from "./data-source";
import express from "express";
import morgan from "morgan";

// express 최상위 함수
const app = express();

// app.use은 app에서 미들웨어를 넣어주는 것
// express.json 미들웨어를 넣어주는 것.
// 리퀘스트에서 json 형태 파일을 보낼 때 express에서 받은 다음 사용하기 위해서
app.use(express.json());
app.use(morgan("dev")); // dev/sort/common/combined

// app.get의 url로 접속을 하면 해당 블록의 코드를 실행
app.get("/", (_, res) => res.send("running"));

let port = 4000;
// app.listen의 포트로 접속하면 해당 블록의 코드를 실행한다.
app.listen(port, async () => {
  console.log(`서버 실행 중~~~~ at http://localhost:${port}`);

  // 백엔드 실행 시 데이터베이스 연결
  AppDataSource.initialize()
    .then(() => {
      console.log("data initialized...");
    })
    .catch((error) => console.log(error));
});
