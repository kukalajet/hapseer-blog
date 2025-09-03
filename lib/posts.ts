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
            className:
              "text-4xl md:text-5xl font-extrabold tracking-tighter mb-8 text-slate-900 dark:text-slate-50 font-sans",
          }),
        h2: (props: React.HTMLAttributes<HTMLHeadingElement>) =>
          React.createElement("h2", {
            ...props,
            className:
              "text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-6 text-slate-900 dark:text-slate-100 font-sans",
          }),
        h3: (props: React.HTMLAttributes<HTMLHeadingElement>) =>
          React.createElement("h3", {
            ...props,
            className:
              "text-xl md:text-2xl font-semibold mt-10 mb-4 text-slate-800 dark:text-slate-200 font-sans",
          }),
        p: (props: React.HTMLAttributes<HTMLParagraphElement>) =>
          React.createElement("p", {
            ...props,
            className:
              "text-lg leading-relaxed mb-6 text-slate-700 dark:text-slate-300 font-serif",
          }),
        a: (props: React.HTMLAttributes<HTMLAnchorElement>) =>
          React.createElement("a", {
            ...props,
            className:
              "text-blue-600 dark:text-blue-400 underline decoration-blue-600/50 hover:decoration-blue-600 transition-colors duration-200",
          }),
        ul: (props: React.HTMLAttributes<HTMLUListElement>) =>
          React.createElement("ul", {
            ...props,
            className:
              "list-disc pl-6 mb-6 space-y-2 text-lg text-slate-700 dark:text-slate-300 font-serif",
          }),
        ol: (props: React.HTMLAttributes<HTMLOListElement>) =>
          React.createElement("ol", {
            ...props,
            className:
              "list-decimal pl-6 mb-6 space-y-2 text-lg text-slate-700 dark:text-slate-300 font-serif",
          }),
        li: (props: React.HTMLAttributes<HTMLLIElement>) =>
          React.createElement("li", { ...props, className: "leading-relaxed" }),
        blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) =>
          React.createElement("blockquote", {
            ...props,
            className:
              "border-l-4 border-blue-500 dark:border-blue-400 bg-slate-100 dark:bg-slate-800 p-4 my-8 text-lg italic text-slate-600 dark:text-slate-400",
          }),
        code: (props: React.HTMLAttributes<HTMLElement>) =>
          React.createElement("code", {
            ...props,
            className:
              "bg-slate-200 dark:bg-slate-700 rounded-md px-2 py-1 text-sm font-mono text-slate-800 dark:text-slate-200",
          }),
        pre: (props: React.HTMLAttributes<HTMLPreElement>) =>
          React.createElement("pre", {
            ...props,
            className:
              "bg-gray-900 text-white rounded-lg p-4 my-8 overflow-x-auto shadow-lg text-sm",
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
