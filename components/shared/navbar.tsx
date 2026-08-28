import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#d2d2d7] bg-[#f5f5f7]/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-[#1d1d1f]">
          Etsy AI Toolkit
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="font-medium">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="px-5 font-medium">Sign up</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
