import Image from "next/image";
import Link from "next/link";
import Label from "@/components/ui/label";
import DateTime from "@/components/ui/time";

export default function Sidebar(props) {
  return (
    <div className="mt-5 font-sans">
      <Searchbar />
      {props.related && (
        <RelatedPosts related={props.related} pathPrefix={props.pathPrefix} />
      )}
      {props.categories && <Categories categories={props.categories} />}
    </div>
  );
}

function Searchbar() {
  return (
    <div>
      <h3 className="text-2xl font-bold dark:text-white">Search Posts</h3>
      <form action="/search" method="GET" className="mt-4">
        <input
          type="search"
          name="q"
          placeholder="Search…"
          className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </form>
    </div>
  );
}

function RelatedPosts({ related, pathPrefix }) {
  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold dark:text-white">Related</h3>
      <div className="mt-6 grid gap-6">
        {related.slice(0, 3).map((item, index) => {
          const imageUrl = item?.featuredImage?.node?.sourceUrl;
          return (
            <Link
              key={index}
              href={`/post/${pathPrefix ? `${pathPrefix}/` : ""}${item.slug}`}>
              <div className="flex gap-5">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={item.title || "Thumbnail"}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">{item.title}</h3>
                  {item.date && (
                    <p className="mt-2 text-sm text-gray-500">
                      <DateTime date={item.date} />
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Categories({ categories }) {
  const list = Array.isArray(categories?.nodes) ? categories.nodes : categories;
  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold dark:text-white">Categories</h3>
      <ul className="mt-4 grid">
        {list.map((item, index) => (
          <li key={item.id ?? index}>
            <Link
              href={`/category/${item.slug}`}
              className="flex items-center justify-between py-2">
              <h4 className="text-gray-800 dark:text-gray-400">{item.name}</h4>
              <Label pill={true}>{item.count ?? 0}</Label>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
