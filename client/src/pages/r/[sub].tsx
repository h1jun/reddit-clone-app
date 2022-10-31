import axios from "axios";
import { useRouter } from "next/router";
import useSWR from "swr";
import Image from "next/image";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import cls from "classnames";
import { useAuthState } from "../../context/auth";

const SubPage = () => {
  const [ownSub, setOwnSub] = useState(false);
  const { authenticated, user } = useAuthState();
  const router = useRouter();

  /**
   * @name 입력 받은 url로 data 가져오는 fetcher 함수
   */
  const fetcher = async (url: string) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error: any) {
      throw error.response.data;
    }
  };

  const subName = router.query.sub; // [sub]으로 했기 때문에 sub으로 들어옴

  // SWR을 사용하여 서버 data 가져오기
  const { data: sub, error } = useSWR(
    subName ? `/subs/${subName}` : null,
    fetcher
  );
  console.log("sub : ", sub);

  // 이미지 업로드
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sub || !user) return;
    // 로그인 되어 있고 user 이름과 sub을 만든 사람의  이름이 같다면 수정 권한 부여!
    setOwnSub(authenticated && user.username === sub.username);
  }, [sub]);

  /**
   * @param event
   * @name 이미지 업로드 시 사용하는 함수
   * @returns
   */
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) return;

    const file = event.target.files[0];
    console.log("file : ", file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", fileInputRef.current!.name); // 배너인지 프로필 사진인지 정보 넣어주기

    try {
      await axios.post(`/subs/${sub.name}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * @name 사진 업로드를 위해서 파일 업로드창 open, ref값을 주어서 함수 실행 시 click event 발생
   * @param type banner(배너) | image (사용자 프로필 사진)
   * @returns
   */
  const openFileInput = (type: string) => {
    // 자신의 커뮤니티(sub)일 때만 클릭이 가능하게, 즉 커뮤니티 생성자만 수정 가능하도록
    if (!ownSub) return;

    const fileInput = fileInputRef.current;
    // 방어코드 :: fileInput가 있다면 실행
    if (fileInput) {
      fileInput.name = type; // name이 type 넣어주기
      fileInput.click();
    }
  };

  return (
    <>
      {sub && (
        <>
          <div>
            <input
              type="file"
              hidden={true}
              ref={fileInputRef}
              onChange={uploadImage}
            />
            {/* 배너 이미지 */}
            <div className="bg-gray-400">
              {sub.bannerUrl ? (
                <div
                  className="h-56"
                  style={{
                    backgroundImage: `url(${sub.bannerUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  onClick={() => openFileInput("banner")}
                ></div>
              ) : (
                <div
                  className="h-20 bg-gray-400"
                  onClick={() => openFileInput("banner")}
                ></div>
              )}
            </div>

            {/* 커뮤니티 메타 데이터 */}
            <div className="h-20 bg-white">
              <div className="relative flex max-w-5xl px-5 mx-auto">
                <div className="absolute" style={{ top: -15 }}>
                  {sub.imageUrl && (
                    // 사용자 프로필 이미지
                    <Image
                      src={sub.imageUrl}
                      alt="커뮤니티 이미지"
                      width={70}
                      height={70}
                      className={cls("rounded-full", {
                        "cursor-pointer": ownSub,
                      })}
                      onClick={() => openFileInput("image")}
                    />
                  )}
                </div>
                <div className="pt-1 pl-24">
                  <div className="flex items-center">
                    <h1 className="text-3xl font-bold ">{sub.title}</h1>
                  </div>
                  <p className="font-bold text-gray-400 text-small">
                    /r/{sub.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* 포스트와 사이드바 */}
          <div className="flex max-w-5xl px-4 pt-5 mx-auto">
            {/* <div className="w-full md:mr-3 md:w-8/12">{renderPosts} </div>
            <SideBar sub={sub} /> */}
          </div>
        </>
      )}
    </>
  );
};

export default SubPage;
