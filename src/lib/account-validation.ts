export type ProfileNameValidationError = 'required' | 'tooLong'
export type PasswordValidationError = 'currentRequired' | 'newRequired' | 'tooShort' | 'mismatch'

const MAX_NAME_LENGTH = 100
const MIN_PASSWORD_LENGTH = 8

export const validateProfileName = (name: string): ProfileNameValidationError | undefined => {
  const trimmed = name.trim()
  if (!trimmed) return 'required'
  if (Array.from(trimmed).length > MAX_NAME_LENGTH) return 'tooLong'
  return undefined
}

export const validatePasswordChange = (
  currentPassword: string,
  newPassword: string,
  confirmation: string
): PasswordValidationError | undefined => {
  if (!currentPassword) return 'currentRequired'
  if (!newPassword) return 'newRequired'
  if (newPassword.length < MIN_PASSWORD_LENGTH) return 'tooShort'
  if (newPassword !== confirmation) return 'mismatch'
  return undefined
}
