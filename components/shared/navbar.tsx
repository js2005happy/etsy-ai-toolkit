import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-xl font-bold text-amber-600">
          Etsy AI Toolkit
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="rounded-full font-medium text-stone-600 hover:bg-stone-100">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full bg-amber-600 px-5 font-semibold text-white shadow-sm hover:bg-amber-700">
              Sign up
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}