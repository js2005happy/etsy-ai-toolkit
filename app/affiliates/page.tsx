import Navbar from "@/components/shared/navbar";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import Reveal from "@/components/shared/reveal";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import { ArrowRight, Link2, Percent, Wallet } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Get your link",
    body: "Apply below and we'll set up your affiliate account with a personal tracking link and banners.",
  },
  {
    icon: ArrowRight,
    title: "Share it",
    body: "Drop your link in a post, video description, or newsletter — wherever your audience already trusts you.",
  },
  {
    icon: Wallet,
    title: "Earn 30%",
    body: "When a reader signs up for a paid plan, you earn 30% of their first month. Payouts via PayPal or Wise.",
  },
];

const perks = [
  {
    title: "A real, daily-use product",
    body: "Fifteen tools that online sellers actually open every day — listings, buyer replies, reviews, keywords, product images, and more.",
  },
  {
    title: "Free tier = easy sell",
    body: "Your readers can try everything with 10 free credits and 3 images, no card. Lower friction, higher conversion.",
  },
  {
    title: "Recurring revenue potential",
    body: "Plans renew monthly, so your audience keeps using it — and you keep the relationship.",
  },
  {
    title: "Ready-made assets",
    body: "Tracking links, banners, and copy so you can start sharing in minutes, not hours.",
  },
];

export default function AffiliatesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="Affiliates"
          title={
            <>
              Earn <span className="text-primary">30%</span> recommending the
              copilot for marketplace sellers
            </>
          }
          subtitle="You have an audience of online sellers. We have the tools they use every day. Recommend Craftly and earn 30% of every paid plan your readers buy."
        />

        <section className="px-5 pb-16">
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <s.icon className="mb-4 h-6 w-6 text-primary" />
                  <h3 className="font-display text-lg text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="px-5 pb-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center font-display text-2xl text-foreground md:text-3xl">
              Why your audience will thank you
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {perks.map((p, i) => (
                <Reveal key={p.title} delay={i * 50}>
                  <div className="h-full rounded-2xl border border-border bg-card p-6">
                    <h3 className="font-display text-lg text-foreground">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-28 md:pb-36">
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
            <Percent className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="font-display text-2xl text-foreground">30% of every paid plan</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              One commission per referred customer, paid on their first month. Want to join? Email
              us and we'll get your account set up.
            </p>
            <a
              href="mailto:js2005happy@gmail.com?subject=Etsy%20AI%20Toolkit%20affiliate%20program"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Apply to become an affiliate
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
