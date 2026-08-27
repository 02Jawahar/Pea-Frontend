import { Link } from 'react-router-dom'

import { Button } from '@/components/common/primitives'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { portalHome } from '@/routes/guards'

export default function NotFound() {
  const { homePortal } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-grey-050 p-6 text-center">
      <p className="text-[13px] font-semibold text-navy-700">404</p>
      <h1 className="text-[22px] font-semibold text-navy-900">Page not found</h1>
      <p className="max-w-md text-[13px] text-grey-600">
        This address does not match any screen in the portal. If you followed a link from an email or
        a notification, the record may have been moved or withdrawn.
      </p>
      <div className="mt-2 flex gap-2">
        <Link to={homePortal ? portalHome(homePortal) : ROUTES.HOME}>
          <Button>{homePortal ? 'Back to my dashboard' : 'Back to home'}</Button>
        </Link>
        <Link to={ROUTES.TRACK_APPLICATION}>
          <Button variant="secondary">Track an application</Button>
        </Link>
      </div>
    </div>
  )
}
