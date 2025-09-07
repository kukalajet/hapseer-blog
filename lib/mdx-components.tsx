import React from "react";
import { Greeting, TweetComponent } from "@/components";

// Custom styled components for MDX content
export const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) =>
    React.createElement("h1", {
      ...props,
      className:
        "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-gray-900 dark:text-gray-100 font-sans leading-tight",
    }),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) =>
    React.createElement("h2", {
      ...props,
      className:
        "text-2xl md:text-3xl font-bold tracking-tight mt-12 mb-4 text-gray-900 dark:text-gray-100 font-sans leading-tight",
    }),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) =>
    React.createElement("h3", {
      ...props,
      className:
        "text-xl md:text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200 font-sans leading-snug",
    }),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) =>
    React.createElement("p", {
      ...props,
      className:
        "text-xl leading-8 mb-6 text-gray-700 dark:text-gray-300 font-serif font-light tracking-wide",
    }),
  a: (props: React.HTMLAttributes<HTMLAnchorElement>) =>
    React.createElement("a", {
      ...props,
      className:
        "text-blue-600 dark:text-blue-400 underline decoration-1 underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200",
    }),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) =>
    React.createElement("ul", {
      ...props,
      className:
        "list-disc pl-8 mb-6 space-y-3 text-xl text-gray-700 dark:text-gray-300 font-serif font-light tracking-wide",
    }),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) =>
    React.createElement("ol", {
      ...props,
      className:
        "list-decimal pl-8 mb-6 space-y-3 text-xl text-gray-700 dark:text-gray-300 font-serif font-light tracking-wide",
    }),
  li: (props: React.HTMLAttributes<HTMLLIElement>) =>
    React.createElement("li", { ...props, className: "leading-8 mb-2" }),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) =>
    React.createElement("blockquote", {
      ...props,
      className:
        "border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 pl-6 pr-4 py-4 my-8 text-xl leading-8 italic text-gray-600 dark:text-gray-400 font-serif font-light tracking-wide",
    }),
  code: (props: React.HTMLAttributes<HTMLElement>) =>
    React.createElement("code", {
      ...props,
      className:
        "bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono text-gray-800 dark:text-gray-200 font-medium",
    }),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) =>
    React.createElement("pre", {
      ...props,
      className:
        "bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg p-6 my-8 overflow-x-auto border border-gray-200 dark:border-gray-700 text-sm font-mono leading-relaxed",
    }),
  Greeting,
  Tweet: TweetComponent,
};

export default mdxComponents;
