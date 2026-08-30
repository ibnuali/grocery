import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { AlertCircle, ArrowLeft, Check, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../components/language-toggle'
import { ThemeToggle } from '../components/theme-toggle'
import type { PublicAuthMode } from '../lib/routes'

interface LoginPageProps {
  mode: PublicAuthMode
}
export const LoginPage: React.FC<LoginPageProps> = ({ mode }) => {
  const { login, register } = useAuth()
  const { t } = useTranslation()
  const isRegister = mode === 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const result = isRegister
      ? await register(email, password, name)
      : await login(email, password)
    if (!result.success) {
      setError(result.error || t(isRegister ? 'login.errorRegister' : 'login.errorLogin'))
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <header className="auth-nav">
        <Link className="auth-nav__back" to="/">
          <ArrowLeft size={16} />
          <span>{t('common.back')}</span>
        </Link>
        <Link className="auth-wordmark" to="/">
          <span><ShoppingCart size={16} strokeWidth={2.5} /></span>
          Grocery Planner
        </Link>
        <div className="auth-nav__controls">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      <main className="auth-layout">
        <section className="auth-story" aria-labelledby="auth-story-title">
          <div>
            <p className="auth-story__label">{t(isRegister ? 'login.registerStoryLabel' : 'login.loginStoryLabel')}</p>
            <h1 id="auth-story-title">{t(isRegister ? 'login.registerStoryTitle' : 'login.loginStoryTitle')}</h1>
            <p>{t(isRegister ? 'login.subtitleRegister' : 'login.subtitleLogin')}</p>
          </div>
          <ul className="auth-story__list">
            <li><Check size={16} />{t('login.authBenefitPlan')}</li>
            <li><Check size={16} />{t('login.authBenefitOffline')}</li>
            <li><Check size={16} />{t('login.authBenefitReceipt')}</li>
          </ul>
        </section>

        <section className="auth-form-panel" aria-labelledby="auth-form-title">
          <div className="auth-form-panel__head">
            <h2 id="auth-form-title">{t(isRegister ? 'login.createAccount' : 'login.signInTitle')}</h2>
            <p>{t(isRegister ? 'login.registerPrompt' : 'login.loginPrompt')}</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegister && (
              <Input
                label={t('login.fullName')}
                placeholder={t('login.fullNamePlaceholder')}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            )}
            <Input
              label={t('login.email')}
              placeholder={t('login.emailPlaceholder')}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label={t('login.password')}
              type="password"
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={8}
            />
            <Button type="submit" size="lg" disabled={loading} aria-busy={loading} className="auth-form__submit">
              {loading ? t('common.submitting') : t(isRegister ? 'login.registerButton' : 'login.loginButton')}
            </Button>
          </form>

          <p className="auth-form-panel__switch">
            {t(isRegister ? 'login.hasAccount' : 'login.needsAccount')}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {t(isRegister ? 'login.navSignIn' : 'login.registerLink')}
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}
