import React from 'react'
import { ArrowRight, Check, ReceiptText, ShoppingBasket, ShoppingCart, WifiOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../components/language-toggle'
import { ThemeToggle } from '../components/theme-toggle'
export const LoginView: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="landing-page">
      <header className="landing-nav" aria-label={t('navigation.label')}>
        <a className="landing-wordmark" href="#top" aria-label="Grocery Planner home">
          <span className="landing-wordmark__mark"><ShoppingCart size={17} strokeWidth={2.5} /></span>
          <span>Grocery Planner</span>
        </a>
        <div className="landing-nav__actions">
          <ThemeToggle />
          <LanguageToggle />
          <Link className="landing-nav__signin" to="/login">{t('login.navSignIn')}</Link>
        </div>
      </header>

      <main>
        <section className="split-hero" id="top">
          <div className="split-hero__copy">
            <h1>{t('login.heroTitle')}</h1>
            <p>{t('login.heroDescription')}</p>
            <div className="split-hero__actions">
              <Link className="landing-cta landing-cta--primary" to="/register">
                {t('login.heroPrimary')} <ArrowRight size={16} />
              </Link>
              <a className="landing-cta landing-cta--quiet" href="#how-it-works">{t('login.heroSecondary')}</a>
            </div>
          </div>

          <div className="grocery-board" aria-label={t('login.previewLabel')}>
            <div className="grocery-board__topline">
              <span>{t('login.previewLabel')}</span>
              <span className="grocery-board__status"><span aria-hidden="true" />{t('login.previewStatus')}</span>
            </div>
            <h2>{t('login.previewTitle')}</h2>
            <div className="grocery-board__list">
              {[t('login.previewItemOne'), t('login.previewItemTwo'), t('login.previewItemThree')].map((item, index) => (
                <div className="grocery-board__item" key={item}>
                  <span className={index < 2 ? 'is-checked' : ''}>{index < 2 && <Check size={13} />}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="grocery-board__budget">
              <span>{t('login.previewBudget')}</span>
              <strong>{t('login.previewPending')}</strong>
            </div>
          </div>
        </section>

        <section className="workflow-studio" id="how-it-works">
          <div className="workflow-studio__intro">
            <h2>{t('login.workflowTitle')}</h2>
            <p>{t('login.workflowDescription')}</p>
          </div>

          <article className="workflow-band">
            <div className="workflow-band__copy">
              <span className="workflow-band__step">01</span>
              <h3>{t('login.stepPlan')}</h3>
              <p>{t('login.stepPlanDescription')}</p>
            </div>
            <div className="workflow-band__proof workflow-band__proof--plan" aria-hidden="true">
              <ShoppingBasket size={28} />
              <span className="proof-line proof-line--long" />
              <span className="proof-line" />
              <span className="proof-line proof-line--short" />
            </div>
          </article>

          <article className="workflow-band workflow-band--reverse">
            <div className="workflow-band__copy">
              <span className="workflow-band__step">02</span>
              <h3>{t('login.stepShop')}</h3>
              <p>{t('login.stepShopDescription')}</p>
            </div>
            <div className="workflow-band__proof workflow-band__proof--shop" aria-hidden="true">
              <WifiOff size={24} />
              <div className="proof-checks"><Check size={18} /><Check size={18} /><span /></div>
            </div>
          </article>

          <article className="workflow-band">
            <div className="workflow-band__copy">
              <span className="workflow-band__step">03</span>
              <h3>{t('login.stepReconcile')}</h3>
              <p>{t('login.stepReconcileDescription')}</p>
            </div>
            <div className="workflow-band__proof workflow-band__proof--receipt" aria-hidden="true">
              <ReceiptText size={28} />
              <span className="receipt-rule" />
              <span className="receipt-rule receipt-rule--short" />
              <span className="receipt-total" />
            </div>
          </article>
        </section>
      </main>

      <footer className="statement-footer">
        <p>{t('login.footerStatement')}</p>
        <div className="statement-footer__meta">
          <span>Grocery Planner</span>
          <Link to="/register">{t('login.heroPrimary')} <ArrowRight size={14} /></Link>
          <span>{t('login.footerMeta')}</span>
        </div>
      </footer>
    </div>
  )
}
