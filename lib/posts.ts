import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

export type PostData = {
  id: string;
  date: string;
  title: string;
  content?: string;
  isMdx?: boolean;
  description: string;
  slug: string;
  thumbnail: string;
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

  return {
    id: slug,
    isMdx,
    content: matterResult.content,
    ...matterResult.data,
  } as PostData;
}

export { getSortedPostsData, getAllPostIds, getPostData };
