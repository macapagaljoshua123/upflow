import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import Reveal from '../components/Reveal.jsx'
import { getAuthToken } from '../api/client.js'

const STEPS = [
  {
    n: '01',
    title: 'Upload your HTML',
    desc: 'Drop in a single file or a whole folder. Upflow keeps your structure exactly as you built it.',
    // TODO: swap with screenshot — e.g. /assets/how-it-works-upload.png
    image: null,
  },
  {
    n: '02',
    title: 'Get a live link',
    desc: 'Every upload becomes a real URL instantly, so you can open it, test it, and click through it like a visitor would.',
    image: null,
  },
  {
    n: '03',
    title: 'Share it your way',
    desc: 'Make it public, keep it private, or invite people by email. You decide who can see it and who can edit it.',
    image: null,
  },
]

const SAFETY_POINTS = [
  { title: 'Sandboxed previews', desc: 'Every HTML file runs in an isolated preview frame, so a page can never reach into your account or anyone else\u2019s.' },
  { title: 'Automatic file scanning', desc: 'Uploads are checked on the way in. Anything that looks like a script meant to harm a visitor is blocked before it goes live.' },
  { title: 'Private by default', desc: 'New uploads start private. Nothing is visible to anyone until you choose to share it.' },
  { title: 'Access you control', desc: 'See exactly who has opened a file, revoke access at any time, and switch a link from public to private in one click.' },
]

const FAQS = [
  { q: 'What can I upload to Upflow?', a: 'Any static HTML file, along with the CSS, JavaScript, images, and assets it references. You can upload a single file or a full folder.' },
  { q: 'Who can see my uploaded pages?', a: 'Only you, until you decide to share. You can set a page to private, public, or invite specific people by email.' },
  { q: 'Can I edit a file after uploading it?', a: 'Yes. You can re-upload a new version, rename it, move it between folders, or replace it entirely without losing the share link.' },
  { q: 'Is there a limit on file size or storage?', a: 'Free accounts include generous storage for prototypes and demos. If you outgrow it, you can add more storage from your account settings.' },
  { q: 'What happens if I delete a shared file?', a: 'The live link stops working immediately for everyone it was shared with. Deleted files move to a recovery period before they\u2019re removed for good.' },
]

export default function Landing() {
  return (
    <div id="top">
      <Header />
      <Hero />
      <HowItWorks />
      <Safety />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  )
}

function Hero() {
  const isSignedIn = Boolean(getAuthToken())
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">HTML preview is the new PowerPoint</span>
          <h1 className="hero-title">Push your HTML live.<br />Share it like a link.</h1>
          <p className="hero-desc">
            Upload any HTML file and Upflow turns it into a working preview you can open, test, and
            send to anyone — no hosting, no deployment, no waiting.
          </p>
          <div className="hero-actions">
            {isSignedIn ? (
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            ) : (
              <Link to="/signup" className="btn btn-primary">Try Upflow Free</Link>
            )}
            <a href="#how-it-works" className="btn btn-ghost">See how it works</a>
          </div>
        </div>

        <Reveal as="div" className="hero-visual" delay={120}>
          <BrowserFrame url="upflow.app/p/portfolio-v2">
            <div className="mock-page">
              <div className="mock-block mock-block-wide" />
              <div className="mock-row">
                <div className="mock-block" />
                <div className="mock-block" />
              </div>
              <div className="mock-block mock-block-tall" />
            </div>
          </BrowserFrame>
        </Reveal>
      </div>

      <style>{`
        .hero { padding: 72px 0 96px; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        .hero-title { font-size: clamp(2.2rem, 4.2vw, 3.4rem); line-height: 1.08; margin: 18px 0 20px; }
        .hero-desc { color: var(--ink-dim); font-size: 1.05rem; max-width: 460px; }
        .hero-actions { display: flex; gap: 14px; margin-top: 32px; flex-wrap: wrap; }
        @media (max-width: 880px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-visual { order: -1; }
        }
      `}</style>
    </section>
  )
}

export function BrowserFrame({ url, children }) {
  return (
    <div className="browser-frame">
      <div className="browser-chrome">
        <span className="dot dot-coral" />
        <span className="dot dot-dim" />
        <span className="dot dot-dim" />
        <div className="browser-url"><span className="lock">🔒</span>{url}</div>
      </div>
      <div className="browser-body">{children}</div>
      <style>{`
        .browser-frame { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; background: var(--surface); box-shadow: 0 30px 60px -20px rgba(0,0,0,0.55); }
        .browser-chrome { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--surface-2); border-bottom: 1px solid var(--border); }
        .dot { width: 9px; height: 9px; border-radius: 50%; }
        .dot-coral { background: var(--coral); }
        .dot-dim { background: rgba(255,255,255,0.18); }
        .browser-url { margin-left: 10px; font-family: var(--font-mono); font-size: 0.78rem; color: var(--ink-dim); background: var(--canvas); padding: 6px 12px; border-radius: 7px; flex: 1; display: flex; align-items: center; gap: 6px; }
        .lock { font-size: 0.7rem; }
        .browser-body { padding: 22px; min-height: 220px; }
        .mock-page { display: flex; flex-direction: column; gap: 12px; }
        .mock-block { background: linear-gradient(135deg, rgba(94,230,197,0.18), rgba(255,138,101,0.12)); border: 1px solid var(--border); border-radius: 10px; height: 46px; }
        .mock-block-wide { height: 64px; }
        .mock-block-tall { height: 90px; }
        .mock-row { display: flex; gap: 12px; }
        .mock-row .mock-block { flex: 1; }
      `}</style>
    </div>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="howitworks">
      <div className="container">
        <span className="eyebrow">How it works</span>
        <h2 className="section-title">From file to live link in three steps</h2>
        <div className="steps-grid">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} className="step-card" delay={i * 100}>
              <div className="step-visual">
                {step.image ? (
                  <img src={step.image} alt={step.title} />
                ) : (
                  <div className="step-placeholder">Screenshot coming soon</div>
                )}
              </div>
              <span className="step-n">{step.n}</span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
      <style>{`
        .howitworks { padding: 72px 0; }
        .section-title { font-size: clamp(1.6rem, 3vw, 2.2rem); margin: 14px 0 44px; max-width: 560px; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .step-card { border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; background: var(--surface); }
        .step-visual { border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 18px; }
        .step-placeholder { height: 140px; display: flex; align-items: center; justify-content: center; background: var(--surface-2); color: var(--ink-dim); font-family: var(--font-mono); font-size: 0.78rem; border: 1px dashed var(--border); border-radius: var(--radius-sm); }
        .step-n { font-family: var(--font-mono); color: var(--flow); font-size: 0.85rem; }
        .step-title { font-size: 1.15rem; margin: 8px 0 10px; }
        .step-desc { color: var(--ink-dim); font-size: 0.92rem; }
        @media (max-width: 880px) {
          .steps-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}

function Safety() {
  return (
    <section id="safety" className="safety">
      <div className="container">
        <span className="eyebrow">Safety</span>
        <h2 className="section-title">Your files, scanned, sandboxed, and yours alone</h2>
        <div className="safety-grid">
          {SAFETY_POINTS.map((point, i) => (
            <Reveal key={point.title} className="safety-card" delay={i * 90}>
              <ShieldIcon />
              <h3 className="safety-title">{point.title}</h3>
              <p className="safety-desc">{point.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
      <style>{`
        .safety { padding: 72px 0; background: var(--surface); }
        .safety-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .safety-card { padding: 4px; }
        .safety-title { font-size: 1.02rem; margin: 14px 0 8px; }
        .safety-desc { color: var(--ink-dim); font-size: 0.88rem; }
        @media (max-width: 980px) {
          .safety-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .safety-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}

function ShieldIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <path d="M12 2.5l7.5 3v6c0 5-3.4 8.4-7.5 10-4.1-1.6-7.5-5-7.5-10v-6l7.5-3z" stroke="var(--flow)" strokeWidth="1.4" />
      <path d="M9 12l2.2 2.2L15.5 9.5" stroke="var(--flow)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Faq() {
  const [openIndex, setOpenIndex] = useState(0)
  return (
    <section id="faq" className="faq">
      <div className="container faq-inner">
        <div className="faq-head">
          <span className="eyebrow">FAQ</span>
          <h2 className="section-title">Questions, answered</h2>
          <p className="faq-sub">Can\u2019t find what you need? Reach out from the Contact link in the footer.</p>
        </div>
        <div className="faq-list">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <Reveal
                key={item.q}
                as="button"
                className={`faq-item ${isOpen ? 'open' : ''}`}
                delay={i * 70}
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
              >
                <div className="faq-q">
                  <span>{item.q}</span>
                  <span className="faq-toggle">{isOpen ? '\u2212' : '+'}</span>
                </div>
                {isOpen && <p className="faq-a">{item.a}</p>}
              </Reveal>
            )
          })}
        </div>
      </div>
      <style>{`
        .faq { padding: 72px 0; }
        .faq-inner { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 48px; }
        .faq-sub { color: var(--ink-dim); margin-top: 14px; font-size: 0.92rem; max-width: 280px; }
        .faq-list { display: flex; flex-direction: column; gap: 10px; }
        .faq-item { width: 100%; text-align: left; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px 20px; color: var(--ink); }
        .faq-item.open { border-color: var(--flow); }
        .faq-q { display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 0.98rem; }
        .faq-toggle { color: var(--flow); font-size: 1.2rem; }
        .faq-a { color: var(--ink-dim); margin-top: 12px; font-size: 0.9rem; line-height: 1.6; }
        @media (max-width: 880px) {
          .faq-inner { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}

function FinalCta() {
  const isSignedIn = Boolean(getAuthToken())
  return (
    <section className="final-cta">
      <div className="container final-cta-inner">
        <Reveal>
          <BrowserFrame url="upflow.app/p/your-page">
            <div className="mock-page">
              <div className="mock-block mock-block-wide" />
              <div className="mock-row">
                <div className="mock-block" />
                <div className="mock-block" />
              </div>
            </div>
          </BrowserFrame>
        </Reveal>
        <Reveal className="final-cta-copy" delay={120}>
          <h2 className="section-title">Get your HTML file live and into someone\u2019s hands</h2>
          <p className="hero-desc">No build step, no server to manage. Upload once, share forever.</p>
          <div className="hero-actions">
            {isSignedIn ? (
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            ) : (
              <Link to="/signup" className="btn btn-primary">Try Upflow</Link>
            )}
            <a href="#gallery" className="btn btn-ghost">Browse the gallery</a>
          </div>
        </Reveal>
      </div>
      <style>{`
        .final-cta { padding: 72px 0 96px; }
        .final-cta-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        @media (max-width: 880px) {
          .final-cta-inner { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
