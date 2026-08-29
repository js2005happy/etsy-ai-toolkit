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
    title: "Acceptance of Terms",
    content: (
      <p>
        By accessing or using Etsy Seller AI Toolkit (&quot;the Service&quot;), you agree to be bound
        by these Terms of Service. If you do not agree, do not use the Service.
      </p>
    ),
  },
  {
    n: "02",
    title: "Description of Service",
    content: (
      <>
        <p>
          Etsy Seller AI Toolkit provides AI-powered tools that help Etsy sellers generate product
          listings, reply to customer messages and reviews, create social media posts, research
          keywords, translate listings, optimize listings, and get pricing suggestions.
        </p>
        <p>
          This Service is an independent third-party tool. It is not affiliated with, endorsed by, or
          connected to Etsy, Inc.
        </p>
      </>
    ),
  },
  {
    n: "03",
    title: "Accounts",
    content: (
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for
        all activity that occurs under your account. You must provide accurate and complete
        information when creating an account.
      </p>
    ),
  },
  {
    n: "04",
    title: "Subscriptions and Billing",
    content: (
      <>
        <p>
          The Service offers a free plan and a paid Pro plan. The Pro plan is billed at $19 USD per
          month and provides unlimited credits and priority processing. Payments are processed by
          Paddle, our merchant of record. By subscribing, you authorize recurring charges until you
          cancel.
        </p>
        <p>
          You may cancel your subscription at any time through the billing portal. Cancellation takes
          effect at the end of the current billing period.
        </p>
      </>
    ),
  },
  {
    n: "05",
    title: "Acceptable Use",
    content: (
      <p>
        You agree not to misuse the Service, including attempting to gain unauthorized access,
        reverse engineer, resell without authorization, or use the Service in violation of any
        applicable law or third-party terms (including Etsy&apos;s own policies).
      </p>
    ),
  },
  {
    n: "06",
    title: "Intellectual Property",
    content: (
      <p>
        The Service and its original content, features, and functionality are owned by us and are
        protected by applicable intellectual property laws. Content you generate using the Service
        remains yours, subject to any rights of third parties.
      </p>
    ),
  },
  {
    n: "07",
    title: "Disclaimer of Warranties",
    content: (
      <p>
        The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis, without
        warranties of any kind. We do not guarantee that generated content will be accurate,
        error-free, or suitable for your specific needs. You are responsible for reviewing
        AI-generated content before use.
      </p>
    ),
  },
  {
    n: "08",
    title: "Limitation of Liability",
    content: (
      <p>
        To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
        special, or consequential damages arising out of or related to your use of the Service.
      </p>
    ),
  },
  {
    n: "09",
    title: "Termination",
    content: (
      <p>
        We may suspend or terminate your access to the Service at any time for violation of these
        Terms. Upon termination, your right to use the Service will immediately cease.
      </p>
    ),
  },
  {
    n: "10",
    title: "Changes to Terms",
    content: (
      <p>
        We may update these Terms from time to time. Material changes will be communicated by
        updating the &quot;Last updated&quot; date above. Continued use of the Service after changes
        constitutes acceptance.
      </p>
    ),
  },
  {
    n: "11",
    title: "Contact",
    content: (
      <p>
        Questions about these Terms? Contact us at{" "}
        <a href="mailto:js2005happy@gmail.com" className="text-primary hover:underline">
          js2005happy@gmail.com
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="Legal"
          title={
            <>
              Terms of <span className="text-primary">Service</span>
            </>
          }
          subtitle="The ground rules for using the Etsy Seller AI Toolkit."
        />

        <section className="px-5 pb-28 md:pb-36">
          <div className="mx-auto max-w-3xl">
            <p className="mb-20 text-sm text-muted-foreground">Last updated: August 28, 2026</p>

            <div className="space-y-16">
              {sections.map((s) => (
                <Reveal key={s.n}>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-[28px]">
                      <span className="mr-3 text-primary">{s.n}</span>
                      {s.title}
                    </h2>
                    <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-muted-foreground">
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
