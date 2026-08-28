import Navbar from "@/components/shared/navbar";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-[#1d1d1f]">Terms of Service</h1>
          <p className="mt-2 text-[#6e6e73]">Last updated: August 28, 2026</p>

          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-[#1d1d1f]">
            <section>
              <h2 className="mb-2 text-xl font-semibold">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Etsy Seller AI Toolkit (&quot;the Service&quot;), you agree to be bound by
                these Terms of Service. If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">2. Description of Service</h2>
              <p>
                Etsy Seller AI Toolkit provides AI-powered tools that help Etsy sellers generate product
                listings, reply to customer messages and reviews, create social media posts, research keywords,
                translate listings, optimize listings, and get pricing suggestions.
              </p>
              <p className="mt-3">
                This Service is an independent third-party tool. It is not affiliated with, endorsed by, or
                connected to Etsy, Inc.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">3. Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all
                activity that occurs under your account. You must provide accurate and complete information when
                creating an account.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">4. Subscriptions and Billing</h2>
              <p>
                The Service offers a free plan and a paid Pro plan. The Pro plan is billed at $19 USD per month
                and provides unlimited credits and priority processing. Payments are processed by Paddle, our
                merchant of record. By subscribing, you authorize recurring charges until you cancel.
              </p>
              <p className="mt-3">
                You may cancel your subscription at any time through the billing portal. Cancellation takes
                effect at the end of the current billing period.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">5. Acceptable Use</h2>
              <p>
                You agree not to misuse the Service, including attempting to gain unauthorized access, reverse
                engineer, resell without authorization, or use the Service in violation of any applicable law or
                third-party terms (including Etsy&apos;s own policies).
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">6. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by us and are
                protected by applicable intellectual property laws. Content you generate using the Service remains
                yours, subject to any rights of third parties.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">7. Disclaimer of Warranties</h2>
              <p>
                The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis, without
                warranties of any kind. We do not guarantee that generated content will be accurate, error-free, or
                suitable for your specific needs. You are responsible for reviewing AI-generated content before use.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
                special, or consequential damages arising out of or related to your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">9. Termination</h2>
              <p>
                We may suspend or terminate your access to the Service at any time for violation of these Terms.
                Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">10. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Material changes will be communicated by updating the
                &quot;Last updated&quot; date above. Continued use of the Service after changes constitutes
                acceptance.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">11. Contact</h2>
              <p>
                Questions about these Terms? Contact us at{" "}
                <a href="mailto:js2005happy@gmail.com" className="text-[#0071e3] hover:underline">
                  js2005happy@gmail.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <footer className="border-t border-[#d2d2d7] bg-[#f5f5f7] py-10">
        <div className="mx-auto max-w-6xl px-5 text-center text-sm text-[#6e6e73]">
          <p>© 2026 Etsy Seller AI Toolkit. Not affiliated with Etsy, Inc.</p>
        </div>
      </footer>
    </div>
  );
}
