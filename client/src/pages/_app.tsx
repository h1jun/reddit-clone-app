import "../styles/globals.css";
import type { AppProps } from "next/app";
import Axios from "axios";

function MyApp({ Component, pageProps }: AppProps) {
  // axios를 이용해서 요청 보내는 모든 baseURL 경로 지정
  Axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api";
  return <Component {...pageProps} />;
}

export default MyApp;
