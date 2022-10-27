import axios from "axios";
import { useRouter } from "next/router";
import useSWR from "swr";

const SubPage = () => {
  const fetcher = async (url: string) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error: any) {
      throw error.response.data;
    }
  };

  const router = useRouter();
  const subName = router.query.sub; // [sub]으로 했기 때문에 sub으로 들어옴
  const { data: sub, error } = useSWR(
    subName ? `/sub/${subName}` : null,
    fetcher
  );

  return <div>Subpage</div>;
};

export default SubPage;
