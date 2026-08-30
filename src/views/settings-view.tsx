import React, { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  BellOff,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  FileText,
  Languages,
  LockKeyhole,
  LogOut,
  Moon,
  Settings2,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Effect } from 'effect'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { PageHeader } from '../components/page-header'
import { ApiError } from '../services/api-client'
import { AccountService } from '../services/account-service'
import { validatePasswordChange, validateProfileName } from '../lib/account-validation'
import { useTheme } from '../hooks/use-theme'
import type { User } from '../domain/auth.schema'

type SettingsViewProps = {
  user: User
  onUserUpdated: (user: User) => void
  onBack: () => void
  onLogout: () => void
}

type FeedbackProps = {
  message: string | null
  success?: boolean
}

type SettingsRowProps = {
  icon: LucideIcon
  label: string
  onClick?: () => void
  end?: React.ReactNode
  ariaPressed?: boolean
}

const Feedback: React.FC<FeedbackProps> = ({ message, success = false }) => {
  if (!message) return null
  return (
    <div className={`settings-feedback${success ? ' settings-feedback--success' : ''}`} role={success ? 'status' : 'alert'}>
      {success ? <CheckCircle2 aria-hidden="true" className="settings-feedback__icon" /> : <AlertCircle aria-hidden="true" className="settings-feedback__icon" />}
      <span>{message}</span>
    </div>
  )
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon: Icon, label, onClick, end, ariaPressed }) => {
  const content = (
    <>
      <Icon aria-hidden="true" className="settings-row__icon" />
      <span className="settings-row__label">{label}</span>
      {end || (onClick ? <ChevronRight aria-hidden="true" className="settings-row__chevron" /> : null)}
    </>
  )

  if (onClick) {
    return <button type="button" className="settings-row" onClick={onClick} aria-pressed={ariaPressed}>{content}</button>
  }

  return <div className="settings-row">{content}</div>
}

const SettingsSwitch: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`settings-switch${active ? ' settings-switch--active' : ''}`} aria-hidden="true">
    <span />
  </span>
)

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUserUpdated, onBack, onLogout }) => {
  const { t, i18n } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()
  const [screen, setScreen] = useState<'menu' | 'profile'>('menu')
  const [name, setName] = useState(user.name)
  const [profilePending, setProfilePending] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordPending, setPasswordPending] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const profileHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (screen === 'profile') profileHeadingRef.current?.focus()
  }, [screen])
  useEffect(() => () => {
    setCurrentPassword('')
    setNewPassword('')
    setPasswordConfirmation('')
  }, [])

  const accountErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof ApiError && error.code === 'INVALID_PASSWORD') return t('settings.errorIncorrectPassword')
    if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') return t('settings.errorValidation')
    return fallback
  }

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)
    const validation = validateProfileName(name)
    if (validation === 'required') {
      setProfileError(t('settings.errorNameRequired'))
      return
    }
    if (validation === 'tooLong') {
      setProfileError(t('settings.errorNameTooLong'))
      return
    }

    setProfilePending(true)
    try {
      const updatedUser = await Effect.runPromise(AccountService.updateProfile(name))
      onUserUpdated(updatedUser)
      setName(updatedUser.name)
      setProfileSuccess(t('settings.profileSuccess'))
    } catch (error) {
      setProfileError(accountErrorMessage(error, t('settings.errorProfileSave')))
    } finally {
      setProfilePending(false)
    }
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)
    const validation = validatePasswordChange(currentPassword, newPassword, passwordConfirmation)
    if (validation === 'currentRequired') {
      setPasswordError(t('settings.errorCurrentRequired'))
      return
    }
    if (validation === 'newRequired') {
      setPasswordError(t('settings.errorNewRequired'))
      return
    }
    if (validation === 'tooShort') {
      setPasswordError(t('settings.errorPasswordTooShort'))
      return
    }
    if (validation === 'mismatch') {
      setPasswordError(t('settings.errorPasswordMismatch'))
      return
    }

    setPasswordPending(true)
    try {
      await Effect.runPromise(AccountService.changePassword(currentPassword, newPassword))
      setCurrentPassword('')
      setNewPassword('')
      setPasswordConfirmation('')
      setPasswordSuccess(t('settings.passwordSuccess'))
    } catch (error) {
      setPasswordError(accountErrorMessage(error, t('settings.errorPasswordSave')))
    } finally {
      setPasswordPending(false)
    }
  }

  const handlePageBack = () => {
    if (screen === 'profile') {
      setScreen('menu')
      setProfileError(null)
      setProfileSuccess(null)
      setCurrentPassword('')
      setNewPassword('')
      setPasswordConfirmation('')
      setPasswordError(null)
      setPasswordSuccess(null)
      return
    }
    onBack()
  }

  const switchLanguage = () => {
    void i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id')
  }

  return (
    <div className={`settings-page${screen === 'profile' ? ' settings-page--profile' : ''}${resolvedTheme === 'light' ? ' settings-page--light' : ''}`}>

      <PageHeader
        className="settings-page__header"
        eyebrow={t('settings.eyebrow')}
        title={screen === 'profile' ? t('settings.editProfileTitle') : t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      {screen === 'menu' ? (
        <>
          <button type="button" className="settings-profile-row" onClick={() => setScreen('profile')}>
            <span className="settings-profile-row__avatar" aria-hidden="true"><UserRound /></span>
            <span className="settings-profile-row__copy">
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </span>
            <ChevronRight aria-hidden="true" />
          </button>

          <div className="settings-list-card" role="group" aria-label={t('settings.preferences')}>
            <SettingsRow icon={BellOff} label={t('settings.pauseNotifications')} />
            <SettingsRow icon={Settings2} label={t('settings.generalSettings')} />
            <SettingsRow
              icon={Moon}
              label={t('settings.darkMode')}
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              end={<SettingsSwitch active={resolvedTheme === 'dark'} />}
              ariaPressed={resolvedTheme === 'dark'}
            />
            <SettingsRow icon={Languages} label={t('settings.language')} onClick={switchLanguage} end={<span className="settings-row__value">{i18n.language === 'id' ? 'ID' : 'EN'}</span>} />
            <SettingsRow icon={UsersRound} label={t('settings.myContact')} />
          </div>

          <div className="settings-list-card" role="group" aria-label={t('settings.help')}>
            <SettingsRow icon={CircleHelp} label={t('settings.faq')} />
            <SettingsRow icon={FileText} label={t('settings.terms')} />
            <SettingsRow icon={ShieldCheck} label={t('settings.userPolicy')} />
          </div>

          <Button type="button" size="sm" className="settings-logout" onClick={onLogout}>
            <LogOut aria-hidden="true" />
            {t('settings.logout')}
          </Button>
        </>
      ) : (
        <>
          <div className="settings-profile-avatar" aria-hidden="true">
            <UserRound />
          </div>

          <section className="settings-card settings-card--profile" aria-labelledby="profile-settings-heading">
            <h2 id="profile-settings-heading" ref={profileHeadingRef} tabIndex={-1} className="settings-sr-only">{t('settings.profileTitle')}</h2>
            <Feedback message={profileError} />
            <Feedback message={profileSuccess} success />
            <form onSubmit={handleProfileSubmit} className="settings-profile-form">
              <label className="settings-profile-field">
                <span>{t('settings.nameLabel')}</span>
                <input id="settings-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} autoComplete="name" aria-required="true" />
              </label>
              <div className="settings-profile-field">
                <span>{t('settings.emailLabel')}</span>
                <span className="settings-profile-field__value">{user.email}</span>
              </div>
              <Button className="settings-submit" type="submit" disabled={profilePending}>{profilePending ? t('settings.savingProfile') : t('settings.saveChanges')}</Button>
            </form>
          </section>

          <details className="settings-password-disclosure">
            <summary><LockKeyhole aria-hidden="true" /><span>{t('settings.passwordTitle')}</span><ChevronRight aria-hidden="true" /></summary>
            <div className="settings-password-disclosure__body">
              <p>{t('settings.passwordSubtitle')}</p>
              <Feedback message={passwordError} />
              <Feedback message={passwordSuccess} success />
              <form onSubmit={handlePasswordSubmit} className="settings-form">
                <Input className="settings-input" id="current-password" label={t('settings.currentPassword')} type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" aria-required="true" />
                <Input className="settings-input" id="new-password" label={t('settings.newPassword')} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" aria-required="true" />
                <Input className="settings-input" id="password-confirmation" label={t('settings.confirmPassword')} type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} autoComplete="new-password" aria-required="true" />
                <Button className="settings-submit" type="submit" variant="soft" disabled={passwordPending}>{passwordPending ? t('settings.changingPassword') : t('settings.changePassword')}</Button>
              </form>
            </div>
          </details>
        </>
      )}
    </div>
  )
}
