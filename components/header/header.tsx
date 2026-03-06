import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const Header: FC = () => {
  return (
    <header className="py-4 border-b border-gray-200 dark:border-gray-700 mb-8">
      <nav className="flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
        >
          <Image
            src="/favicon.ico"
            alt="Hapseer Logo"
            width={32}
            height={32}
            className="mr-2"
          />
          <span className="text-2xl font-sans">Hapseer</span>
        </Link>
        <div className="flex items-center gap-3">
          <a
            href="https://www.x.com/kukalajet"
            className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 transition-colors hover:underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @kukalajet
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export { Header };
