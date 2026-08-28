import Navbar from "@/components/shared/navbar";
import PageHero from "@/components/shared/page-hero";
import SiteFooter from "@/components/shared/site-footer";
import Reveal from "@/components/shared/reveal";
import CinematicBackground from "@/components/cinematic/cinematic-background";

type Section = {
  n: string;
  title: string;
  content: React.ReactNode;
};

const sections: Section[] = [
  {
    n: "01",
    title: "Subscriptions",
    content: (
      <p>
        The Pro plan is a recurring monthly subscription billed at $19 USD per month. Subscriptions renew
        automatically each billing period until cancelled.
      </p>
    ),
  },
  {
    n: "02",
    title: "Cancellation",
    content: (
      <p>
        You may cancel your subscription at any time through the billing portal or by contacting us.
        Cancellation stops future charges and takes effect at the end of the current billing period. You
        will continue to have access to Pro features until the end of the period you have already paid for.
      </p>
    ),
  },
  {
    n: "03",
    title: "Refunds",
    content: (
      <>
        <p>
          If you are not satisfied with the Service, contact us within 14 days of your most recent charge and
          we will issue a refund for that charge. Refunds are issued to the original payment method.
        </p>
        <p>
          Refunds are not provided for earlier billing periods, for partial months, or after a subscription
          has been cancelled and access has already been used for the paid period.
        </p>
      </>
    ),
  },
  {
    n: "04",
    title: "Chargebacks and Disputes",
    content: (
      <p>
        If you believe a charge is incorrect, please contact us first so we can resolve it before filing a
        dispute with your bank or card issuer.
      </p>
    ),
  },
  {
    n: "05",
    title: "Contact",
    content: (
      <p>
        Refund or cancellation requests: contact us at{" "}
        <a href="mailto:js2005happy@gmail.com" className="text-[#ff8a52] hover:underline">
          js2005happy@gmail.com
        </a>
        .
      </p>
    ),
  },
];

export default function RefundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="Legal"
          title={
            <>
              Refund &amp; <span className="text-[#ff8a52]">Cancellation</span>
            </>
          }
          subtitle="Our simple, no-nonsense refund and cancellation policy."
        />

        <section className="px-5 pb-28 md:pb-36">
          <div className="mx-auto max-w-3xl">
            <p className="mb-20 text-sm text-white/60">Last updated: August 28, 2026</p>

            <div className="space-y-16">
              {sections.map((s) => (
                <Reveal key={s.n}>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white md:text-[28px]">
                      <span className="mr-3 text-[#ff8a52]">{s.n}</span>
                      {s.title}
                    </h2>
                    <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-white/70">
                      {s.content}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
