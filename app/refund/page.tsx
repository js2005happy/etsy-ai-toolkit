import Navbar from "@/components/shared/navbar";

export default function RefundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-[#1d1d1f]">Refund &amp; Cancellation Policy</h1>
          <p className="mt-2 text-[#6e6e73]">Last updated: August 28, 2026</p>

          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-[#1d1d1f]">
            <section>
              <h2 className="mb-2 text-xl font-semibold">1. Subscriptions</h2>
              <p>
                The Pro plan is a recurring monthly subscription billed at $19 USD per month. Subscriptions renew
                automatically each billing period until cancelled.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">2. Cancellation</h2>
              <p>
                You may cancel your subscription at any time through the billing portal or by contacting us.
                Cancellation stops future charges and takes effect at the end of the current billing period. You
                will continue to have access to Pro features until the end of the period you have already paid for.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">3. Refunds</h2>
              <p>
                If you are not satisfied with the Service, contact us within 14 days of your most recent charge and
                we will issue a refund for that charge. Refunds are issued to the original payment method.
              </p>
              <p className="mt-3">
                Refunds are not provided for earlier billing periods, for partial months, or after a subscription
                has been cancelled and access has already been used for the paid period.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">4. Chargebacks and Disputes</h2>
              <p>
                If you believe a charge is incorrect, please contact us first so we can resolve it before filing a
                dispute with your bank or card issuer.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">5. Contact</h2>
              <p>
                Refund or cancellation requests: contact us at{" "}
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
