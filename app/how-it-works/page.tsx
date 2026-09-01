import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/shared/navbar'
import SiteFooter from '@/components/shared/site-footer'
import Reveal from '@/components/shared/reveal'
import Faq from '@/components/shared/faq'

export const metadata: Metadata = {
  title: 'How it works — Craftly',
  description:
    "Craftly learns how you write from twenty of your own messages, then drafts listings, posts, and replies inside that voice. Here's exactly what happens, step by step.",
}

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="k-wrap k-page-head">
          <div className="k-breadcrumb">
            <Link href="/">Home</Link> / How it works
          </div>
          <div className="eyebrow">Under the hood</div>
          <h1 className="k-h1" style={{ marginTop: 16 }}>
            It learns you,
            <br />
            then <span className="grad">stays out</span>{' '}
            <em className="serif-accent">of the way.</em>
          </h1>
          <p className="k-lead">
            Most writing tools start from a blank page and a generic idea of
            &ldquo;good copy&rdquo;. Craftly starts from twenty things you
            already wrote, and stays inside them.
          </p>
        </section>

        <section className="k-wrap" style={{ paddingTop: 0 }}>
          <Reveal className="k-step-row">
            <div>
              <div className="k-num">1</div>
            </div>
            <div>
              <h3>You describe it badly</h3>
              <p>
                Open a tool, type the way you&apos;d text a friend, and attach a
                phone photo if you have one. Spelling, grammar, and punctuation
                are all irrelevant — the messier the better, honestly. Craftly
                reads intent, not prose.
              </p>
              <p>
                Most people finish this in under two minutes. There&apos;s no
                form to fill and no dropdowns to fight.
              </p>
              <div className="k-cardlet">
                <span className="k-lbl">What you actually type</span>
                <p>speckled mug sage glaze 12oz dishwasher ok — small batch, made last week</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="k-step-row">
            <div>
              <div className="k-num">2</div>
            </div>
            <div>
              <h3>Craftly reads your voice first</h3>
              <p>
                Before it writes anything, it pulls from your voice profile —
                built from twenty past messages and your recent listings. It
                measures four things: how warm you are, how long your sentences
                run, which words you use, and which ones you never touch.
              </p>
              <p>
                That last one matters most. If you never write
                &ldquo;elevate&rdquo;, &ldquo;curated&rdquo;, or
                &ldquo;artisanal&rdquo;, neither will we.
              </p>
              <div className="k-split">
                <div className="k-cardlet">
                  <span className="k-lbl">Voice profile — Sage &amp; Clay Co.</span>
                  <p>{`Match · 96%
Warmth · High
Length · Medium
Filler · None
Never uses · elevate, curated, must-have`}</p>
                </div>
                <div className="k-cardlet">
                  <span className="k-lbl">Built from</span>
                  <p>{`24 past buyer messages
12 published listings
6 Instagram captions
2 shop policy pages`}</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="k-step-row">
            <div>
              <div className="k-num">3</div>
            </div>
            <div>
              <h3>You get three, not one</h3>
              <p>
                Every run returns three variants. Not three shades of the same
                sentence — three genuinely different angles: a straightforward
                one, a shorter one, and one with more personality. Pick the
                closest and edit the rest by hand.
              </p>
              <p>
                Nothing is locked. The output is a text box, and it&apos;s yours
                to change, shorten, or throw out.
              </p>
              <div className="k-cardlet">
                <span className="k-lbl">Variant A</span>
                <p>
                  Hand-thrown Speckled Mug — Sage. Thrown on the wheel in small
                  batches, then glazed in a soft sage that pools a shade deeper
                  near the foot.
                </p>
              </div>
              <span className="k-arrow">↓ two more angles included</span>
            </div>
          </Reveal>

          <Reveal className="k-step-row">
            <div>
              <div className="k-num">4</div>
            </div>
            <div>
              <h3>Publish, or copy and leave</h3>
              <p>
                Send it straight to Etsy, Shopify, Amazon Handmade, Instagram,
                Pinterest, TikTok Shop, or eBay. Or copy the text and paste it
                wherever you like — there&apos;s no lock-in and no watermark.
              </p>
              <p>
                Everything you publish stays yours. Export your whole library as
                CSV or Markdown whenever you want, including if you cancel.
              </p>
              <div className="k-pipe">
                <div>
                  <b>Connect</b>
                  <h4>OAuth, no passwords</h4>
                  <span>Grant access per channel. Revoke any of them in one click.</span>
                </div>
                <div>
                  <b>Generate</b>
                  <h4>One voice, 15 tools</h4>
                  <span>Listings, captions, replies, and emails all read from the same profile.</span>
                </div>
                <div>
                  <b>Publish</b>
                  <h4>Or just copy it</h4>
                  <span>Push to seven marketplaces, or copy plain text and go.</span>
                </div>
                <div>
                  <b>Export</b>
                  <h4>Leave any time</h4>
                  <span>CSV or Markdown, full history, no questions asked.</span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="k-wrap" style={{ paddingTop: 0 }}>
          <Reveal>
            <div className="eyebrow">The honest comparison</div>
            <h2 className="k-h2">Where Craftly fits.</h2>
            <p className="k-lead">
              We&apos;re not the right tool for everything. Here&apos;s the
              straight version.
            </p>
          </Reveal>
          <div className="k-table-wrap">
            <table className="k-table">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>Craftly</th>
                  <th>A generic AI writer</th>
                  <th>Writing it yourself</th>
                  <th>Hiring a copywriter</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sounds like you</td>
                  <td className="yes hl">✓ Profile-driven, 96% match</td>
                  <td className="no">Generic brand voice</td>
                  <td className="yes">✓ Obviously</td>
                  <td className="yes">✓ After a few rounds</td>
                </tr>
                <tr>
                  <td>Time per listing</td>
                  <td className="yes hl">✓ About 90 seconds</td>
                  <td>5–10 min of prompting</td>
                  <td className="no">25–40 minutes</td>
                  <td className="no">2–5 days</td>
                </tr>
                <tr>
                  <td>Knows marketplaces</td>
                  <td className="yes hl">✓ 7 channels, per-channel rules</td>
                  <td className="no">None</td>
                  <td className="no">Whatever you&apos;ve learned</td>
                  <td>Varies</td>
                </tr>
                <tr>
                  <td>Learns your shop policies</td>
                  <td className="yes hl">✓ Yes, for buyer replies</td>
                  <td className="no">No</td>
                  <td className="yes">✓ You wrote them</td>
                  <td className="no">Needs briefing</td>
                </tr>
                <tr>
                  <td>Cost for 40 listings/mo</td>
                  <td className="yes hl">✓ Pro, $19/mo</td>
                  <td>$20–200</td>
                  <td className="no">~20 hours</td>
                  <td className="no">$1,200+</td>
                </tr>
                <tr>
                  <td>Works offline</td>
                  <td className="no">No</td>
                  <td className="no">No</td>
                  <td className="yes">✓ Yes</td>
                  <td className="yes">✓ Yes</td>
                </tr>
                <tr>
                  <td>Good at long-form</td>
                  <td className="no">Not really — short-form only</td>
                  <td className="yes">✓ Yes</td>
                  <td className="yes">✓ Yes</td>
                  <td className="yes">✓ Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="k-wrap" style={{ paddingTop: 0 }}>
          <Reveal>
            <div className="eyebrow">What we don&apos;t do</div>
            <h2 className="k-h2">Three limits, stated up front.</h2>
          </Reveal>
          <div className="k-grid k-g3" style={{ marginTop: 44 }}>
            <Reveal className="k-cell">
              <div className="k-ico">01</div>
              <h3>No long-form</h3>
              <p>
                Craftly is built for things under 300 words. Blog posts and
                about pages need a human and a slow afternoon.
              </p>
            </Reveal>
            <Reveal className="k-cell">
              <div className="k-ico">02</div>
              <h3>No image generation</h3>
              <p>
                We&apos;ll caption and tag your photos, but we won&apos;t invent
                them. Your work should look like your work.
              </p>
            </Reveal>
            <Reveal className="k-cell">
              <div className="k-ico">03</div>
              <h3>No invented facts</h3>
              <p>
                If you don&apos;t tell us the dimensions, we leave a blank
                rather than guessing. Wrong specs cost more than no specs.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="k-wrap" style={{ paddingTop: 0 }}>
          <Reveal>
            <div className="eyebrow">FAQ</div>
            <h2 className="k-h2">Practical questions.</h2>
          </Reveal>
          <Faq
            items={[
              {
                q: 'How many messages do you need to learn my voice?',
                a: "Twenty is the sweet spot — roughly your last ten buyer conversations and ten listings. Under twelve and we'll ask for a couple more before generation unlocks.",
              },
              {
                q: 'Can I edit the voice profile by hand?',
                a: 'Yes. Every profile has four dials — warmth, length, humor, and formality — plus a blocklist of words you never want to see. Changes apply to everything generated after that point.',
              },
              {
                q: 'Do you train on my listings?',
                a: "Your content is yours. We use it to serve you, not to improve a shared model. Delete anything and it's gone from our systems within seven days.",
              },
              {
                q: 'What if the copy comes out wrong?',
                a: 'Hit regenerate — you get three more. If a whole tool is consistently off, lower the match threshold in your profile or add the offending words to your blocklist.',
              },
              {
                q: 'Is there an API?',
                a: 'Not publicly yet. Pro and Scale accounts get early access to the private beta — ask in the dashboard.',
              },
            ]}
          />

          <Reveal className="k-cta-band" style={{ marginTop: 80 }}>
            <h2 className="k-h2">Read the output before you believe us.</h2>
            <p className="k-lead">
              Ten generations a month, free forever. No card, and no sales
              call.
            </p>
            <div className="k-cta-row">
              <Link href="/dashboard" className="k-btn k-btn-primary">
                <span>Open the workspace</span>
                <i className="k-shine" />
              </Link>
              <Link href="/examples" className="k-btn">
                See real examples
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
