import Link from "next/link";
import React from "react";

const register = () => {
  return (
    <div className="bg-white">
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="w-10/12 mx-auto md:w-96">
          <h1 className="mb-2 text-lg font-medium">회원 가입</h1>
          <form>
            <button className="w-full py-2 mb-1 text-cs font-bold text-white uppercaser bg-gray-400 border-gray-400 rounded">
              회원 가입
            </button>
          </form>
          <small>
            이미 가입하셨나요?About
            <Link href="/login">
              <a className="ml-1 text-blue-500 uppercase ">로그인</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default register;
