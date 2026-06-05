import { getAllPosts } from "@/lib/post";
import { fetchTopModels } from "@/lib/hf-models";
import HomeClient from "./HomeClient";

export default async function Home() {
  const posts = getAllPosts();
  const models = await fetchTopModels();

  return <HomeClient posts={posts} models={models} />;
}
