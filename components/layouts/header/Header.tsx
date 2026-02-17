import Image from "next/image";
import Link from "next/link";
import { HeaderLink } from "./HeaderLink";
import type { THeaderLink } from "@/types/header-links";
import HeaderAuth from "./HeaderAuth";

export default function Header({ links }: { links: ReadonlyArray<THeaderLink> }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.svg" alt="Logo" width={120} height={56} priority />
        </Link>
        <nav>
          <ul className="m-0 flex list-none gap-6 p-0">
            {links.map((el) => (
              <li key={el.text}>
                <HeaderLink link={el} />
              </li>
            ))}
            <li>
              <HeaderAuth />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
