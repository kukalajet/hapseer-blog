import { getPostData, getAllPostIds } from "@/lib/posts";
import type { Metadata } from "next";

type Props = {
  params: {
    slug: string;
  };
};

// Generate metadata for each blog post page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const postData = await getPostData(params.slug);
  return {
    title: postData.title,
  };
}

// Statically generate routes for all posts at build time
export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map((path) => ({
    slug: path.params.slug,
  }));
}

export default async function PostPage({ params }: Props) {
  const postData = await getPostData(params.slug);

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-2">{postData.title}</h1>
      <div className="text-md text-gray-500 mb-8">{postData.date}</div>

      <article
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }}
      />
    </div>
  );
}
