import { Fingerprint, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { OtpModal } from '@/components/common/OtpModal'
import { Banner, Button, Card, Field, Input } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { seed } from '@/mock/api'

/** Candidate auth: Aadhaar-registered mobile / registration number + OTP. */
export default function CandidateLogin() {
  const [identifier, setIdentifier] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { loginAsCandidate } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? ROUTES.CANDIDATE_DASHBOARD

  const demo = seed.candidates.find((candidate) => candidate.id === seed.DEMO_CANDIDATE_ID)!

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
      <Card title="Candidate Login">
        <div className="space-y-4">
          <Field
            label="Registered Mobile Number or Registration Number"
            required
            hint="The Aadhaar-registered mobile captured at enrolment is your login ID."
          >
            <Input
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value)
                setError(null)
              }}
              onKeyDown={(event) => event.key === 'Enter' && setShowOtp(true)}
              placeholder={demo.mobile}
              autoFocus
            />
          </Field>

          {error && (
            <p className="text-[13px] text-red-600" role="alert">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            onClick={() => {
              if (!identifier.trim()) {
                setError('Enter your registered mobile number or registration number.')
                return
              }
              setShowOtp(true)
            }}
          >
            <Fingerprint className="size-4" />
            Send OTP
          </Button>

          <Banner tone="info">
            Demo — sign in as <span className="font-medium">{demo.name}</span> using{' '}
            <span className="font-mono">{demo.mobile}</span> and OTP{' '}
            <span className="font-mono">123456</span>.
          </Banner>

          <div className="border-t border-grey-200 pt-4">
            <p className="text-[13px] text-grey-600">Not enrolled yet?</p>
            <Link to={ROUTES.REGISTER}>
              <Button variant="secondary" className="mt-2 w-full">
                <UserPlus className="size-4" />
                New Registration
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <Card title="Enrolled candidates in this demo" bodyClassName="p-0">
        <ul className="divide-y divide-grey-200">
          {seed.candidates.slice(0, 6).map((candidate) => (
            <li key={candidate.id}>
              <button
                type="button"
                onClick={() => {
                  setIdentifier(candidate.mobile)
                  setShowOtp(true)
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-grey-050"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-blue-050 text-[12px] font-semibold text-navy-700">
                  {candidate.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-navy-900">
                    {candidate.name}
                  </span>
                  <span className="block text-[12px] text-grey-600">
                    {candidate.registrationNo} · {candidate.mobile} · {candidate.category}
                    {candidate.isPwBD && ' · PwBD'}
                  </span>
                </span>
                <span className="text-[12px] text-grey-600">
                  {candidate.profileCompletion}% profile
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <OtpModal
        open={showOtp}
        onClose={() => setShowOtp(false)}
        onVerified={() => {
          loginAsCandidate(identifier)
          setShowOtp(false)
          navigate(redirectTo, { replace: true })
        }}
        destination={identifier.includes('@') ? identifier : identifier || demo.mobile}
        purpose="candidate sign-in"
      />
    </div>
  )
}
