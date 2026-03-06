import Link from "next/link";
import { getPostData, getAllPostIds, estimateReadingTime } from "@/lib/posts";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/lib/mdx-components";
import { ReadingProgress } from "@/components";

import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const postData = await getPostData(slug);

  const fullUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:3000`;

  return {
    title: postData.title,
    description: postData.description,
    openGraph: {
      title: postData.title,
      description: postData.description,
      type: "article",
      url: `${fullUrl}/blog/${postData.slug}`,
      images: [
        {
          url: `${fullUrl}${postData.thumbnail}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: postData.title,
      description: postData.description,
      images: [`${fullUrl}${postData.thumbnail}`],
    },
  };
}

export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map((path) => ({
    slug: path.params.slug,
  }));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const postData = await getPostData(slug);

  return (
    <div className="w-full">
      <ReadingProgress />
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
        </svg>
        All posts
      </Link>
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">{postData.title}</h1>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
        {postData.author && (
          <span>
            {postData.author.url ? (
              <a href={postData.author.url} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors" target="_blank" rel="noopener noreferrer">
                {postData.author.name}
              </a>
            ) : (
              postData.author.name
            )}
          </span>
        )}
        <span>{postData.date}</span>
        <span>{estimateReadingTime(postData.content!)} min read</span>
      </div>

      <article className="prose dark:prose-invert max-w-none">
        <MDXRemote
          source={postData.content!}
          components={mdxComponents}
          options={{
            mdxOptions: {
              rehypePlugins: [
                rehypeSlug,
                rehypeAutolinkHeadings,
                [
                  rehypeExternalLinks,
                  { target: "_blank", rel: ["noopener", "noreferrer"] },
                ],
              ],
            },
          }}
        />
      </article>
    </div>
  );
}
