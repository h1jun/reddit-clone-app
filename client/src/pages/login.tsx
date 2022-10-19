import React, { FormEvent, useState } from "react";
import InputGroup from "../components/inputGroup";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuthDispath, useAuthState } from "../context/auth";

function Login() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<any>({});

  const { authenticated } = useAuthState();
  if (authenticated) router.push("/"); // 로그인 된 경우 main 페이지로 이동

  const dispath = useAuthDispath();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await axios.post(
        "/auth/login",
        {
          password,
          username,
        },
        {
          withCredentials: true,
        }
      );

      // 백엔드에서 받아온 user 정보를 context에 저장
      dispath("LOGIN", res.data?.user);
      router.push("/");
    } catch (error: any) {
      console.log(error);
      setErrors(error.response.data || {});
    }
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="w-10/12 mx-auto md:w-96">
          <h1 className="mb-2 text-lg font-medium">로그인</h1>
          <form onSubmit={handleSubmit}>
            <InputGroup
              placeholder="Username"
              value={username}
              setValue={setUsername}
              error={errors.username}
            />
            <InputGroup
              placeholder="password"
              value={password}
              setValue={setPassword}
              error={errors.password}
            />
            <button className="w-full py-2 mb-1 text-cs font-bold text-white uppercaser bg-gray-400 border-gray-400 rounded">
              로그인
            </button>
          </form>
          <small>
            아직 아이디가 없나요?
            <Link href="/register">
              <a className="ml-1 text-blue-500 uppercase ">회원가입</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;
