import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default function HomePage() {
  const allPostsData = getSortedPostsData();

  return (
    <section>
      <ul className="space-y-8">
        {allPostsData.map(({ id, date, title, description }) => (
          <li key={id}>
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                <Link
                  href={`/blog/${id}`}
                  className="text-xl font-semibold hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                >
                  {title}
                </Link>
                <small className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-0 sm:ml-4 shrink-0">
                  {date}
                </small>
              </div>
              {description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-base leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
