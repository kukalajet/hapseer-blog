import { getPostData, getAllPostIds } from "@/lib/posts";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const postData = await getPostData(slug);
  return {
    title: postData.title,
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
      <h1 className="text-4xl font-bold mb-2">{postData.title}</h1>
      <div className="text-md text-gray-500 mb-8">{postData.date}</div>

      <article
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }}
      />
    </div>
  );
}
