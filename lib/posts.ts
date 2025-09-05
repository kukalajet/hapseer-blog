import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkMdx from "remark-mdx";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeReact from "rehype-react";
import React from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { mdxComponents } from "./mdx-components";

const postsDirectory = path.join(process.cwd(), "posts");

export type PostData = {
  id: string;
  date: string;
  title: string;
  content?: React.ReactElement;
  isMdx?: boolean;
};

function getSortedPostsData(): Omit<PostData, "content">[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => {
      const id = fileName.replace(/\.(md|mdx)$/, "");

      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      const matterResult = matter(fileContents);

      return {
        id,
        isMdx: fileName.endsWith(".mdx"),
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
  return fileNames
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => {
      return {
        params: {
          slug: fileName.replace(/\.(md|mdx)$/, ""),
        },
      };
    });
}

async function getPostData(slug: string): Promise<PostData> {
  // Check for both .md and .mdx files
  let fullPath: string;
  let isMdx = false;

  const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
  const mdPath = path.join(postsDirectory, `${slug}.md`);

  if (fs.existsSync(mdxPath)) {
    fullPath = mdxPath;
    isMdx = true;
  } else if (fs.existsSync(mdPath)) {
    fullPath = mdPath;
    isMdx = false;
  } else {
    throw new Error(`Post not found: ${slug}`);
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  // Create a unified remark processor
  let remarkProcessor = remark();

  // Add MDX support if needed
  if (isMdx) {
    remarkProcessor = remarkProcessor.use(remarkMdx);
  }

  // Process content through unified pipeline
  const processedContent = await remarkProcessor
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeReact, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      jsx: jsx,
      jsxs: jsxs,
      components: mdxComponents,
    })
    .process(matterResult.content);

  const content = processedContent.result;

  return {
    id: slug,
    isMdx,
    content,
    ...matterResult.data,
  } as PostData;
}

export { getSortedPostsData, getAllPostIds, getPostData };
