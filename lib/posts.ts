import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeReact from "rehype-react";
import React from "react";
import { jsx, jsxs } from "react/jsx-runtime";

const postsDirectory = path.join(process.cwd(), "posts");

export type PostData = {
  id: string;
  date: string;
  title: string;
  content?: React.ReactElement;
};

function getSortedPostsData(): Omit<PostData, "content">[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, "");

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const matterResult = matter(fileContents);

    return {
      id,
      ...matterResult.data,
    } as Omit<PostData, "content">;
  });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        slug: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

async function getPostData(slug: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeReact, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      jsx: jsx,
      jsxs: jsxs,
      components: {
        h1: (props: React.HTMLAttributes<HTMLHeadingElement>) =>
          React.createElement("h1", {
            ...props,
            className: "text-3xl font-bold",
          }),
        h2: (props: React.HTMLAttributes<HTMLHeadingElement>) =>
          React.createElement("h2", {
            ...props,
            className: "text-2xl font-bold mt-8 mb-4",
          }),
        p: (props: React.HTMLAttributes<HTMLParagraphElement>) =>
          React.createElement("p", { ...props, className: "mb-4" }),
        a: (props: React.HTMLAttributes<HTMLAnchorElement>) =>
          React.createElement("a", {
            ...props,
            className: "text-blue-600 hover:underline",
          }),
        ul: (props: React.HTMLAttributes<HTMLUListElement>) =>
          React.createElement("ul", {
            ...props,
            className: "list-disc pl-8 mb-4",
          }),
        ol: (props: React.HTMLAttributes<HTMLOListElement>) =>
          React.createElement("ol", {
            ...props,
            className: "list-decimal pl-8 mb-4",
          }),
        li: (props: React.HTMLAttributes<HTMLLIElement>) =>
          React.createElement("li", { ...props, className: "mb-2" }),
        blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) =>
          React.createElement("blockquote", {
            ...props,
            className: "border-l-4 border-gray-300 pl-4 italic my-4",
          }),
        code: (props: React.HTMLAttributes<HTMLElement>) =>
          React.createElement("code", {
            ...props,
            className: "bg-gray-100 rounded-md px-2 py-1 text-sm",
          }),
        pre: (props: React.HTMLAttributes<HTMLPreElement>) =>
          React.createElement("pre", {
            ...props,
            className: "bg-gray-800 text-white rounded-md p-4 overflow-x-auto",
          }),
      },
    })
    .process(matterResult.content);

  const content = processedContent.result;

  return {
    id: slug,
    content,
    ...matterResult.data,
  } as PostData;
}

export { getSortedPostsData, getAllPostIds, getPostData };
