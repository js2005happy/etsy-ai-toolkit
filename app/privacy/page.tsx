import Navbar from "@/components/shared/navbar";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-[#1d1d1f]">Privacy Policy</h1>
          <p className="mt-2 text-[#6e6e73]">Last updated: August 28, 2026</p>

          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-[#1d1d1f]">
            <section>
              <h2 className="mb-2 text-xl font-semibold">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, including:</p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Account information: email address and authentication details.</li>
                <li>Usage data: the prompts and inputs you submit to our AI tools.</li>
                <li>Billing information: handled by our payment processor; we do not store full card details.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To provide, operate, and improve the Service.</li>
                <li>To process your subscription and send billing-related communications.</li>
                <li>To respond to support requests.</li>
                <li>To enforce our Terms and prevent abuse.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">3. Payment Information</h2>
              <p>
                Payments are processed by Paddle, our merchant of record. When you subscribe, your payment
                details are collected and processed by Paddle in accordance with Paddle&apos;s privacy policy. We do
                not have access to or store your full payment card details.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">4. Cookies and Analytics</h2>
              <p>
                We use cookies and similar technologies to maintain your session and understand how the Service is
                used. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">5. Data Sharing</h2>
              <p>
                We do not sell your personal information. We may share information with service providers who help
                us operate the Service (such as hosting and payment processing), and when required by law.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">6. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to provide the
                Service and comply with legal obligations. You may request deletion of your account by contacting us.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">7. Your Rights</h2>
              <p>
                Depending on your location, you may have the right to access, correct, or delete your personal
                information, and to object to or restrict certain processing. To exercise these rights, contact us
                using the details below.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be reflected by the
                &quot;Last updated&quot; date above.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">9. Contact</h2>
              <p>
                Privacy questions? Contact us at{" "}
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
