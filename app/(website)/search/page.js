import { Suspense } from "react";
import SearchClient from "./SearchClient";
import Loading from "@/components/loading";

export const metadata = {
  title: "Search",
  description: "Search all articles",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchClient />
    </Suspense>
  );
}
