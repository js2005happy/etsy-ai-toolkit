import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import SiteFooter from "@/components/shared/site-footer";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import Reveal from "@/components/shared/reveal";

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-5 py-24">
        <Reveal>
          <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-10 text-center md:p-12">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              You&apos;re all set.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Your subscription is active. Head to your dashboard to start using
              all your AI tools.
            </p>
            <Link href="/dashboard" className="mt-8 inline-block">
              <span className="rounded-full bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Go to dashboard
              </span>
            </Link>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
