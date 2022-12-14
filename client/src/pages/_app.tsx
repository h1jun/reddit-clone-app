import "../styles/globals.css";
import type { AppProps } from "next/app";
import Axios from "axios";
import { AuthProvider } from "../context/auth";
import { useRouter } from "next/router";
import { NavBar } from "../components/NavBar";
import { SWRConfig } from "swr";
import axios from "axios";

function MyApp({ Component, pageProps }: AppProps) {
  // axios를 이용해서 요청 보내는 모든 baseURL 경로 지정
  Axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api";
  Axios.defaults.withCredentials = true;

  // pathname이 register과 login이 포함하고 있을 때는 NavBar 안 보여주기
  const { pathname } = useRouter();
  const authRoutes = ["/register", "/login"];
  const authRoute = authRoutes.includes(pathname);

  const fetcher = async (url: string) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error: any) {
      throw error.response.data;
    }
  };

  return (
    <SWRConfig
      value={{
        fetcher,
      }}
    >
      <AuthProvider>
        {/* register, login 페이지가 아니면 NavBar show */}
        {!authRoute && <NavBar />}
        <div className={authRoute ? "" : "pt-16"}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </SWRConfig>
  );
}

export default MyApp;
