const ERROR_KEY_MAP = {
  'El nombre debe tener al menos 2 caracteres': 'nameTooShort',
  'Email inválido': 'invalidEmail',
  'La contraseña debe tener al menos 8 caracteres': 'passwordTooShort',
  'La contraseña debe contener al menos una mayúscula': 'passwordNoUppercase',
  'La contraseña debe contener al menos un número': 'passwordNoNumber',
  'Este email ya está registrado': 'emailTaken',
  'Error al crear la cuenta': 'registerFailed',
  'Email y contraseña son requeridos': 'missingCredentials',
  'Email o contraseña incorrectos': 'invalidCredentials',
  'Error al iniciar sesión': 'loginFailed',
};

export function mapApiError(t, rawMessage) {
  if (!rawMessage) return null;
  const key = ERROR_KEY_MAP[rawMessage];
  return key ? t(`errors.${key}`) : rawMessage;
}
