import Link from "next/link";
import { FC } from "react";

const Header: FC = () => {
  return (
    <header className="py-4 border-b border-gray-200 mb-8">
      <nav className="flex justify-between items-center">
        <Link href="/" className="text-gray-800 hover:text-gray-500">
          <span className="text-2xl text-gray-800 font-sans">Hapseer</span>
        </Link>
        <a
          href="https://www.x.com/kukalajet"
          className="text-gray-800 hover:text-gray-500"
          target="_blank"
          rel="noopener noreferrer"
        >
          @kukalajet
        </a>
      </nav>
    </header>
  );
};

export { Header };
