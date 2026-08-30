import React, { useEffect, useState } from 'react'
import { ArrowRight, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../components/language-toggle'

export const LoginView: React.FC = () => {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 24) }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* N5 · Floating pill */}
      <nav className={`nav-pill${scrolled ? ' nav-pill--scrolled' : ''}`} aria-label={t('navigation.label')}>
        <a className="nav-pill__wordmark" href="#top" aria-label="Grocery Planner home">
          <span className="nav-pill__mark"><ShoppingCart size={14} strokeWidth={2.5} /></span>
          <span className="nav-pill__name">Grocery Planner</span>
        </a>
        <div className="nav-pill__links">
          <a href="#how-it-works">{t('login.navHowItWorks')}</a>
          <Link to="/login">{t('login.navSignIn')}</Link>
        </div>
        <LanguageToggle />
      </nav>

      <main className="landing-page">
        {/* H1 · Marquee hero */}
        <section className="marquee-hero" id="top">
          <h1 className="marquee-hero__display">{t('login.heroTitle')}</h1>
          <p className="marquee-hero__description">{t('login.heroDescription')}</p>
          <Link className="marquee-hero__cta" to="/login">
            {t('login.heroSecondary')} <ArrowRight size={15} />
          </Link>
        </section>

        {/* Mid-page marquee divider */}
        <div className="marquee-divider" aria-hidden="true">
          <div className="marquee-divider__track">
            <span>{t('login.marqueeTicker')}</span>
            <span>{t('login.marqueeTicker')}</span>
          </div>
        </div>

        {/* F4 · Step sequence */}
        <section className="landing-workflow" id="how-it-works">
          <div className="landing-workflow__head">
            <h2>{t('login.workflowTitle')}</h2>
            <p>{t('login.workflowDescription')}</p>
          </div>
          <ol className="step-sequence">
            <li className="step-sequence__item">
              <span className="step-sequence__number">1</span>
              <div className="step-sequence__body">
                <h3>{t('login.stepPlan')}</h3>
                <p>{t('login.stepPlanDescription')}</p>
              </div>
            </li>
            <li className="step-sequence__item">
              <span className="step-sequence__number">2</span>
              <div className="step-sequence__body">
                <h3>{t('login.stepShop')}</h3>
                <p>{t('login.stepShopDescription')}</p>
              </div>
            </li>
            <li className="step-sequence__item">
              <span className="step-sequence__number">3</span>
              <div className="step-sequence__body">
                <h3>{t('login.stepReconcile')}</h3>
                <p>{t('login.stepReconcileDescription')}</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Ft8 · Marquee footer */}
        <footer className="foot-marquee" aria-label="Footer">
          <div className="foot-marquee__track" aria-hidden="true">
            <span>{t('login.footerTicker')}</span>
            <span>{t('login.footerTicker')}</span>
          </div>
          <div className="foot-marquee__meta">
            <span className="foot-marquee__wordmark">Grocery Planner</span>
            <span>{t('login.footerMeta')}</span>
          </div>
        </footer>
      </main>
    </>
  )
}
