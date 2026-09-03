import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/shared/navbar'
import SiteFooter from '@/components/shared/site-footer'
import Reveal from '@/components/shared/reveal'
import Faq from '@/components/shared/faq'
import { getServerTranslations } from '@/lib/i18n/server'

export const metadata: Metadata = {
  title: 'How it works — Craftly',
  description:
    "Set your tone once, and Craftly drafts listings, posts, and replies that stay in your voice. Here's exactly what happens, step by step.",
}

export default function HowItWorksPage() {
  const { t } = getServerTranslations()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="k-wrap k-page-head">
          <div className="k-breadcrumb">
            <Link href="/">{t('marketing.howItWorks.bcHome')}</Link> / {t('marketing.howItWorks.bcCurrent')}
          </div>
          <div className="eyebrow">{t('marketing.howItWorks.eyebrow')}</div>
          <h1 className="k-h1" style={{ marginTop: 16 }}>
            {t('marketing.howItWorks.h1a')}
            <br />
            {t('marketing.howItWorks.h1b')} <span className="grad">{t('marketing.howItWorks.h1grad')}</span>{' '}
            <em className="serif-accent">{t('marketing.howItWorks.h1em')}</em>
          </h1>
          <p className="k-lead">{t('marketing.howItWorks.lead')}</p>
        </section>

        <section className="k-wrap" style={{ paddingTop: 0 }}>
          <Reveal className="k-step-row">
            <div>
              <div className="k-num">1</div>
            </div>
            <div>
              <h3>{t('marketing.howItWorks.step1t')}</h3>
              <p>{t('marketing.howItWorks.step1p1')}</p>
              <p>{t('marketing.howItWorks.step1p2')}</p>
              <div className="k-cardlet">
                <span className="k-lbl">{t('marketing.howItWorks.step1lbl')}</span>
                <p>{t('marketing.howItWorks.step1sample')}</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="k-step-row">
            <div>
              <div className="k-num">2</div>
            </div>
            <div>
              <h3>{t('marketing.howItWorks.step2t')}</h3>
              <p>{t('marketing.howItWorks.step2p1')}</p>
              <p>{t('marketing.howItWorks.step2p2')}</p>
              <div className="k-split">
                <div className="k-cardlet">
                  <span className="k-lbl">{t('marketing.howItWorks.step2lbl1')}</span>
                  <p>{t('marketing.howItWorks.step2sample1')}</p>
                </div>
                <div className="k-cardlet">
                  <span className="k-lbl">{t('marketing.howItWorks.step2lbl2')}</span>
                  <p>{t('marketing.howItWorks.step2sample2')}</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="k-step-row">
            <div>
              <div className="k-num">3</div>
            </div>
            <div>
              <h3>{t('marketing.howItWorks.step3t')}</h3>
              <p>{t('marketing.howItWorks.step3p1')}</p>
              <p>{t('marketing.howItWorks.step3p2')}</p>
              <div className="k-cardlet">
                <span className="k-lbl">{t('marketing.howItWorks.step3lbl')}</span>
                <p>{t('marketing.howItWorks.step3sample')}</p>
              </div>
              <span className="k-arrow">{t('marketing.howItWorks.step3arrow')}</span>
            </div>
          </Reveal>

          <Reveal className="k-step-row">
            <div>
              <div className="k-num">4</div>
            </div>
            <div>
              <h3>{t('marketing.howItWorks.step4t')}</h3>
              <p>{t('marketing.howItWorks.step4p1')}</p>
              <p>{t('marketing.howItWorks.step4p2')}</p>
              <div className="k-pipe">
                <div>
                  <b>{t('marketing.howItWorks.pipe1t')}</b>
                  <h4>{t('marketing.howItWorks.pipe1h')}</h4>
                  <span>{t('marketing.howItWorks.pipe1s')}</span>
                </div>
                <div>
                  <b>{t('marketing.howItWorks.pipe2t')}</b>
                  <h4>{t('marketing.howItWorks.pipe2h')}</h4>
                  <span>{t('marketing.howItWorks.pipe2s')}</span>
                </div>
                <div>
                  <b>{t('marketing.howItWorks.pipe3t')}</b>
                  <h4>{t('marketing.howItWorks.pipe3h')}</h4>
                  <span>{t('marketing.howItWorks.pipe3s')}</span>
                </div>
                <div>
                  <b>{t('marketing.howItWorks.pipe4t')}</b>
                  <h4>{t('marketing.howItWorks.pipe4h')}</h4>
                  <span>{t('marketing.howItWorks.pipe4s')}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="k-wrap" style={{ paddingTop: 0 }}>
          <Reveal>
            <div className="eyebrow">{t('marketing.howItWorks.cmpEyebrow')}</div>
            <h2 className="k-h2">{t('marketing.howItWorks.cmpH')}</h2>
            <p className="k-lead">{t('marketing.howItWorks.cmpLead')}</p>
          </Reveal>
          <div className="k-table-wrap">
            <table className="k-table">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>{t('marketing.howItWorks.th1')}</th>
                  <th>{t('marketing.howItWorks.th2')}</th>
                  <th>{t('marketing.howItWorks.th3')}</th>
                  <th>{t('marketing.howItWorks.th4')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t('marketing.howItWorks.r1')}</td>
                  <td className="yes hl">{t('marketing.howItWorks.r1c1')}</td>
                  <td className="no">{t('marketing.howItWorks.r1c2')}</td>
                  <td className="yes">{t('marketing.howItWorks.r1c3')}</td>
                  <td className="yes">{t('marketing.howItWorks.r1c4')}</td>
                </tr>
                <tr>
                  <td>{t('marketing.howItWorks.r2')}</td>
                  <td className="yes hl">{t('marketing.howItWorks.r2c1')}</td>
                  <td>{t('marketing.howItWorks.r2c2')}</td>
                  <td className="no">{t('marketing.howItWorks.r2c3')}</td>
                  <td className="no">{t('marketing.howItWorks.r2c4')}</td>
                </tr>
                <tr>
                  <td>{t('marketing.howItWorks.r3')}</td>
                  <td className="yes hl">{t('marketing.howItWorks.r3c1')}</td>
                  <td className="no">{t('marketing.howItWorks.r3c2')}</td>
                  <td className="no">{t('marketing.howItWorks.r3c3')}</td>
                  <td>{t('marketing.howItWorks.r3c4')}</td>
                </tr>
                <tr>
                  <td>{t('marketing.howItWorks.r4')}</td>
                  <td className="yes hl">{t('marketing.howItWorks.r4c1')}</td>
                  <td className="no">{t('marketing.howItWorks.r4c2')}</td>
                  <td className="yes">{t('marketing.howItWorks.r4c3')}</td>
                  <td className="no">{t('marketing.howItWorks.r4c4')}</td>
                </tr>
                <tr>
                  <td>{t('marketing.howItWorks.r5')}</td>
                  <td className="yes hl">{t('marketing.howItWorks.r5c1')}</td>
                  <td>{t('marketing.howItWorks.r5c2')}</td>
                  <td className="no">{t('marketing.howItWorks.r5c3')}</td>
                  <td className="no">{t('marketing.howItWorks.r5c4')}</td>
                </tr>
                <tr>
                  <td>{t('marketing.howItWorks.r6')}</td>
                  <td className="no">{t('marketing.howItWorks.r6c1')}</td>
                  <td className="no">{t('marketing.howItWorks.r6c2')}</td>
                  <td className="yes">{t('marketing.howItWorks.r6c3')}</td>
                  <td className="yes">{t('marketing.howItWorks.r6c4')}</td>
                </tr>
                <tr>
                  <td>{t('marketing.howItWorks.r7')}</td>
                  <td className="no">{t('marketing.howItWorks.r7c1')}</td>
                  <td className="yes">{t('marketing.howItWorks.r7c2')}</td>
                  <td className="yes">{t('marketing.howItWorks.r7c3')}</td>
                  <td className="yes">{t('marketing.howItWorks.r7c4')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="k-wrap" style={{ paddingTop: 0 }}>
          <Reveal>
            <div className="eyebrow">{t('marketing.howItWorks.limEyebrow')}</div>
            <h2 className="k-h2">{t('marketing.howItWorks.limH')}</h2>
          </Reveal>
          <div className="k-grid k-g3" style={{ marginTop: 44 }}>
            <Reveal className="k-cell">
              <div className="k-ico">01</div>
              <h3>{t('marketing.howItWorks.lim1t')}</h3>
              <p>{t('marketing.howItWorks.lim1d')}</p>
            </Reveal>
            <Reveal className="k-cell">
              <div className="k-ico">02</div>
              <h3>{t('marketing.howItWorks.lim2t')}</h3>
              <p>{t('marketing.howItWorks.lim2d')}</p>
            </Reveal>
            <Reveal className="k-cell">
              <div className="k-ico">03</div>
              <h3>{t('marketing.howItWorks.lim3t')}</h3>
              <p>{t('marketing.howItWorks.lim3d')}</p>
            </Reveal>
          </div>
        </section>

        <section className="k-wrap" style={{ paddingTop: 0 }}>
          <Reveal>
            <div className="eyebrow">{t('marketing.howItWorks.faqEyebrow')}</div>
            <h2 className="k-h2">{t('marketing.howItWorks.faqH')}</h2>
          </Reveal>
          <Faq
            items={[
              { q: t('marketing.howItWorks.faq1q'), a: t('marketing.howItWorks.faq1a') },
              { q: t('marketing.howItWorks.faq2q'), a: t('marketing.howItWorks.faq2a') },
              { q: t('marketing.howItWorks.faq3q'), a: t('marketing.howItWorks.faq3a') },
              { q: t('marketing.howItWorks.faq4q'), a: t('marketing.howItWorks.faq4a') },
              { q: t('marketing.howItWorks.faq5q'), a: t('marketing.howItWorks.faq5a') },
            ]}
          />

          <Reveal className="k-cta-band" style={{ marginTop: 80 }}>
            <h2 className="k-h2">{t('marketing.howItWorks.ctaH')}</h2>
            <p className="k-lead">{t('marketing.howItWorks.ctaLead')}</p>
            <div className="k-cta-row">
              <Link href="/dashboard" className="k-btn k-btn-primary">
                <span>{t('marketing.howItWorks.ctaBtn1')}</span>
                <i className="k-shine" />
              </Link>
              <Link href="/examples" className="k-btn">
                {t('marketing.howItWorks.ctaBtn2')}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
