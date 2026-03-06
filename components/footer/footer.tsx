import { FC } from "react";

const Footer: FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 py-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <span>&copy; {year} Hapseer. All rights reserved.</span>
        <div className="flex gap-4">
          <a
            href="https://www.x.com/kukalajet"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            X / Twitter
          </a>
          <a
            href="/rss.xml"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
