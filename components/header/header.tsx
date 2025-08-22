import Link from "next/link";
import { FC } from "react";

const Header: FC = () => {
  return (
    <header className="py-4 border-b border-gray-200 mb-8">
      <div className="flex justify-between items-center">
        <span className="text-gray-800">kukalajet</span>
        <nav>
          <Link href="/" className="text-gray-800 hover:text-gray-500">
            essays
          </Link>
        </nav>
      </div>
    </header>
  );
};

export { Header };
