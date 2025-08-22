import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default function HomePage() {
  const allPostsData = getSortedPostsData();

  return (
    <section>
      <ul className="space-y-4">
        {allPostsData.map(({ id, date, title }) => (
          <li key={id}>
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <Link
                href={`/blog/${id}`}
                className="text-lg hover:text-gray-500"
              >
                {title}
              </Link>
              <small className="text-gray-500 mt-1 sm:mt-0">{date}</small>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
