/**
 * Typed access to `import.meta.env`.
 *
 * Vite inlines these at build time, so in a container they arrive as Docker
 * build args, not runtime env vars. A missing value must never throw during
 * module init — that would white-screen the whole app on a misconfigured
 * deploy — so we fall back to a documented default and warn instead.
 */
const DEFAULTS = {
  VITE_API_BASE_URL: 'http://localhost:8000/api',
  VITE_APP_NAME: 'PEA',
} as const

function read(key: keyof typeof DEFAULTS): string {
  const value = import.meta.env[key]
  if (value) return value

  console.warn(
    `[env] ${key} was not set at build time; falling back to "${DEFAULTS[key]}". ` +
      'Pass it as a Docker build arg (see the Dockerfile) or in .env for local development.',
  )
  return DEFAULTS[key]
}

export const env = {
  apiBaseUrl: read('VITE_API_BASE_URL'),
  appName: read('VITE_APP_NAME'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
