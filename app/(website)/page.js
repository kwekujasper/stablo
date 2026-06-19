import HomePage from "./home";
import { getAllPosts } from "@/lib/wordpress/api";

export default async function IndexPage() {
  const posts = await getAllPosts(14);
  return <HomePage posts={posts} />;
}

export const revalidate = 3600;
