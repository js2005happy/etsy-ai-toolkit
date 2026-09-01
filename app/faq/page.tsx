import Navbar from "@/components/shared/navbar";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import Reveal from "@/components/shared/reveal";
import CinematicBackground from "@/components/cinematic/cinematic-background";

type Faq = { q: string; a: string };

const faqs: Faq[] = [
  {
    q: "What is Craftly?",
    a: "A single workspace for marketplace sellers to write listings, reply to customers, research keywords, translate and optimize listings, price products, and generate product images — across 10 marketplaces including Etsy, Amazon, Shopify, eBay, TikTok Shop, Temu, and Walmart.",
  },
  {
    q: "How do credits work?",
    a: "Each AI generation (a listing, a set of replies, a keyword list, etc.) costs one credit. The free plan includes 10 credits per month. Paid plans include more credits and unlock extra tools like image generation.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. The free plan requires no card. Sign up and start generating right away.",
  },
  {
    q: "How do I upgrade or cancel my plan?",
    a: "Go to Account → Manage Billing, or the Pricing page. You can upgrade, downgrade, or cancel at any time through the Paddle customer portal.",
  },
  {
    q: "Which tools are included in each plan?",
    a: "Free includes listing, messages, reviews, social posts, and keywords. Basic adds translation, optimizer, and pricing advisor. Pro and Scale unlock product image generation and higher monthly limits.",
  },
  {
    q: "Can I use these tools from Claude Code or Codex?",
    a: "Yes. The toolkit ships an MCP server with all 15 tools. Grab your personal MCP key in Account → MCP connection, then add the etsy-ai-toolkit-mcp server to your client. Credits and image quota are tracked against your own account.",
  },
  {
    q: "Do you have an affiliate program?",
    a: "Yes. Recommend Craftly to your audience and earn 30% of every paid plan you refer (paid on their first month). There's a free tier to make it easy to try. See the Affiliates page to apply.",
  },
  {
    q: "What happens to my credits at the end of the month?",
    a: "Credits reset at the start of each billing month. Unused credits do not roll over.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. We don't sell your data, and payment details are handled entirely by Paddle — we never see or store your full card number. See our Privacy Policy for details.",
  },
  {
    q: "Is this tool affiliated with Etsy?",
    a: "No. Etsy Seller AI Toolkit is an independent product and is not affiliated with or endorsed by Etsy, Inc.",
  },
];

export default function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="Help"
          title={
            <>
              Frequently asked <span className="text-primary">questions</span>
            </>
          }
          subtitle="Everything you need to know about credits, plans, and billing."
        />

        <section className="px-5 pb-28 md:pb-36">
          <div className="mx-auto max-w-2xl space-y-4">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 40}>
                <details className="group rounded-2xl border border-border bg-card transition-colors open:border-primary/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-[16px] font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="text-xl leading-none text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="px-6 pb-6 text-[15px] leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
