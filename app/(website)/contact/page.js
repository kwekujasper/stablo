import { getSettings } from "@/lib/wordpress/api";
import Contact from "./contact";

export default async function ContactPage() {
  const settings = await getSettings();
  return <Contact settings={settings} />;
}

export const revalidate = 3600;
