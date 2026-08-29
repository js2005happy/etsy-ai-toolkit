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
    title: "Information We Collect",
    content: (
      <>
        <p>We collect information you provide directly to us, including:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Account information: email address and authentication details.</li>
          <li>Usage data: the prompts and inputs you submit to our AI tools.</li>
          <li>Billing information: handled by our payment processor; we do not store full card details.</li>
        </ul>
      </>
    ),
  },
  {
    n: "02",
    title: "How We Use Your Information",
    content: (
      <ul className="list-disc pl-6 space-y-1">
        <li>To provide, operate, and improve the Service.</li>
        <li>To process your subscription and send billing-related communications.</li>
        <li>To respond to support requests.</li>
        <li>To enforce our Terms and prevent abuse.</li>
      </ul>
    ),
  },
  {
    n: "03",
    title: "Payment Information",
    content: (
      <p>
        Payments are processed by Paddle, our merchant of record. When you subscribe, your payment
        details are collected and processed by Paddle in accordance with Paddle&apos;s privacy policy. We do
        not have access to or store your full payment card details.
      </p>
    ),
  },
  {
    n: "04",
    title: "Cookies and Analytics",
    content: (
      <p>
        We use cookies and similar technologies to maintain your session and understand how the Service is
        used. You can control cookies through your browser settings.
      </p>
    ),
  },
  {
    n: "05",
    title: "Data Sharing",
    content: (
      <p>
        We do not sell your personal information. We may share information with service providers who help
        us operate the Service (such as hosting and payment processing), and when required by law.
      </p>
    ),
  },
  {
    n: "06",
    title: "Data Retention",
    content: (
      <p>
        We retain your information for as long as your account is active or as needed to provide the
        Service and comply with legal obligations. You may request deletion of your account by contacting us.
      </p>
    ),
  },
  {
    n: "07",
    title: "Your Rights",
    content: (
      <p>
        Depending on your location, you may have the right to access, correct, or delete your personal
        information, and to object to or restrict certain processing. To exercise these rights, contact us
        using the details below.
      </p>
    ),
  },
  {
    n: "08",
    title: "Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. Changes will be reflected by the
        &quot;Last updated&quot; date above.
      </p>
    ),
  },
  {
    n: "09",
    title: "Contact",
    content: (
      <p>
        Privacy questions? Contact us at{" "}
        <a href="mailto:js2005happy@gmail.com" className="text-primary hover:underline">
          js2005happy@gmail.com
        </a>
        .
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CinematicBackground />
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="Legal"
          title={
            <>
              Privacy <span className="text-primary">Policy</span>
            </>
          }
          subtitle="How we handle your data, in plain language."
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
