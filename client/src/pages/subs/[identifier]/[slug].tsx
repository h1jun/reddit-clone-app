import React from "react";
import { useRouter } from "next/router";
import axios from "axios";
import useSWR from "swr";
import { Post } from "../../../types";

const PostPage = () => {
  const router = useRouter();
  const { identifier, sub, slug } = router.query;

  const { data: post, error } = useSWR<Post>(
    identifier && slug ? `/post/${identifier}/${slug}` : null
  );

  return <div>PostPage</div>;
};

export default PostPage;
