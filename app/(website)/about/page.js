import { getAllAuthors, getSettings } from "@/lib/wordpress/api";
import About from "./about";

export default async function AboutPage() {
  const [authors, settings] = await Promise.all([
    getAllAuthors(),
    getSettings(),
  ]);
  return <About settings={settings} authors={authors} />;
}

export const revalidate = 3600;
