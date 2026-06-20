import Link from "next/link";
import Label from "@/components/ui/label";

export default function CategoryLabel({ categories, nomargin = false }) {
  // Accepts either WP `categories.nodes` array or a flat array
  const list = Array.isArray(categories?.nodes)
    ? categories.nodes
    : Array.isArray(categories)
    ? categories
    : [];

  if (!list.length) return null;

  return (
    <div className="flex gap-3">
      {list.slice(0, 3).map((category, index) => (
        <Link href={`/category/${category.slug}`} key={index}>
          <Label nomargin={nomargin}>{category.name}</Label>
        </Link>
      ))}
    </div>
  );
}
