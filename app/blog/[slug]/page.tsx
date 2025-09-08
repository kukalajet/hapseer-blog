import { getPostData, getAllPostIds } from "@/lib/posts";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/lib/mdx-components";

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
  const postData = (await getPostData(slug)) as any;

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
      <h1 className="text-5xl font-bold mb-2">{postData.title}</h1>
      <div className="text-lg text-gray-500 mb-8">{postData.date}</div>

      <article className="prose max-w-none">
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
