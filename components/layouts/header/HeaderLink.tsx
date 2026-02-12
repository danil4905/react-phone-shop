import type { THeaderLink } from "@/types/header-links";
import Link from "next/link";

export const HeaderLink = ({link, isActive}: {link: THeaderLink, isActive?: boolean}) => (<Link href={link.href}>{link.text}</Link>)