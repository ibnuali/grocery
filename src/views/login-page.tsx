import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { AlertCircle, ArrowLeft, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../components/language-toggle'

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth()
  const { t } = useTranslation()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (isRegister) {
      const res = await register(email, password, name)
      if (!res.success) setError(res.error || t('login.errorRegister'))
    } else {
      const res = await login(email, password)
      if (!res.success) setError(res.error || t('login.errorLogin'))
    }
    setLoading(false)
  }

  const switchMode = () => {
    setIsRegister((current) => !current)
    setError(null)
  }

  return (
    <div className="login-page">
      <nav className="login-page__nav">
        <Link className="login-page__back" to="/">
          <ArrowLeft size={15} />
          <span>{t('login.title')}</span>
        </Link>
        <LanguageToggle />
      </nav>

      <div className="login-page__body">
        <div className="login-page__head">
          <h1>{isRegister ? t('login.createAccount') : t('login.title')}</h1>
          <p>{isRegister ? t('login.subtitleRegister') : t('login.subtitleLogin')}</p>
        </div>

        <div className="login-page__card">
          <div className="login-page__card-head">
            <span className="login-page__icon"><ShoppingCart size={18} /></span>
            <span>{isRegister ? t('login.registerButton') : t('login.loginButton')}</span>
          </div>
          {error && (
            <div className="login-page__error" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="login-page__form">
            {isRegister && (
              <Input
                label={t('login.fullName')}
                placeholder={t('login.fullNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              label={t('login.email')}
              placeholder={t('login.emailPlaceholder')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label={t('login.password')}
              type="password"
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <Button type="submit" size="lg" disabled={loading} className="login-page__submit">
              {loading ? t('common.submitting') : isRegister ? t('login.registerButton') : t('login.loginButton')}
            </Button>
          </form>
          <button type="button" className="login-page__switch" onClick={switchMode}>
            {isRegister ? t('login.switchToLogin') : t('login.switchToRegister')}
          </button>
        </div>
      </div>
    </div>
  )
}
