import { Bell, LogOut, Menu, X } from 'lucide-react'
import { Suspense, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import { GrievanceLauncher } from '@/components/common/GrievanceLauncher'
import { Button } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { AccessibilityControls } from './AccessibilityControls'
import { GovBrand } from './Emblem'
import { NeedHelpCard } from './NeedHelpCard'
import { Footer } from './StaffShell'
import { PORTAL_NAV } from './navigation'

/**
 * Shell A — public and candidate pages.
 *
 * "full-width navy header, accessibility controls, language switcher,
 * Login / New Registration. No left sidebar on public pages. Candidate pages
 * get a left sidebar after login."
 */
export function PublicShell({
  title,
  subtitle,
  withSidebar = false,
}: {
  title?: string
  subtitle?: string
  withSidebar?: boolean
}) {
  const { candidate, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [navOpen, setNavOpen] = useState(false)
  const showSidebar = withSidebar && Boolean(candidate)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 bg-navy-900 text-white">
        <div className="flex items-center gap-3 px-4 py-2.5">
          {showSidebar && (
            <button
              type="button"
              className="rounded-md p-1.5 hover:bg-white/10 lg:hidden"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
          )}

          <Link to={ROUTES.HOME} className="shrink-0">
            <GovBrand />
          </Link>

          {title && (
            <div className="mx-auto hidden min-w-0 max-w-md text-center 2xl:block">
              <h1 className="clamp-1 text-[18px] leading-tight font-semibold tracking-wide">
                {title}
              </h1>
              {subtitle && <p className="clamp-1 text-[12px] text-white/75">{subtitle}</p>}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <AccessibilityControls />

            {candidate ? (
              <>
                <button
                  type="button"
                  className="relative rounded-md p-1.5 hover:bg-white/10"
                  aria-label="Notifications"
                >
                  <Bell className="size-4" />
                  <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold">
                    3
                  </span>
                </button>

                <div className="flex items-center gap-2 rounded-md py-1 pr-2 pl-2 hover:bg-white/10">
                  <span className="flex size-8 items-center justify-center rounded-full bg-white/15 text-[12px] font-semibold">
                    {candidate.initials}
                  </span>
                  <span className="hidden max-w-44 min-w-0 text-left leading-tight sm:block">
                    <span className="clamp-1 block text-[13px] font-medium">{candidate.name}</span>
                    <span className="clamp-1 block text-[11px] text-white/70">
                      Candidate ID: {candidate.registrationNo}
                    </span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate(ROUTES.HOME)
                  }}
                  className="rounded-md p-1.5 hover:bg-white/10"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              </>
            ) : (
              <>
                <Link to={ROUTES.CANDIDATE_LOGIN}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="border-white/40 bg-transparent text-white ring-white/40 hover:bg-white/10"
                  >
                    Login
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="success" size="sm">
                    New Registration
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {!isAuthenticated && (
          <nav className="border-t border-white/10 px-4">
            <ul className="flex flex-wrap gap-x-1 text-[13px]">
              {[
                { label: 'Home', to: ROUTES.HOME },
                { label: 'Track Application', to: ROUTES.TRACK_APPLICATION },
                { label: 'Track Grievance', to: ROUTES.TRACK_GRIEVANCE },
                { label: 'PEA Login', to: ROUTES.LOGIN },
              ].map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      cn(
                        'inline-block border-b-2 px-3 py-2 transition-colors',
                        isActive
                          ? 'border-amber-500 text-white'
                          : 'border-transparent text-white/75 hover:text-white',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <div className="flex flex-1">
        {showSidebar && (
          <CandidateSidebar className="sticky top-[57px] h-[calc(100vh-57px)] w-56 shrink-0 border-r border-grey-200 bg-white max-lg:hidden" />
        )}

        {showSidebar && navOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-navy-900/40"
              onClick={() => setNavOpen(false)}
            />
            <div className="relative h-full w-64 overflow-y-auto bg-white">
              <div className="flex justify-end p-2">
                <button
                  type="button"
                  onClick={() => setNavOpen(false)}
                  className="rounded-md p-1.5 text-grey-600 hover:bg-grey-100"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
              <CandidateSidebar onNavigate={() => setNavOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <Suspense fallback={<SkeletonCards />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <GrievanceLauncher />
      <Footer />
    </div>
  )
}

function CandidateSidebar({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  return (
    <aside className={cn('flex flex-col', className)}>
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {PORTAL_NAV.candidate.map((group, index) => (
          <div key={group.label ?? index} className={cn(index > 0 && 'mt-4')}>
            {group.label && (
              <p className="label-caps clamp-1 mb-1 px-3 pb-1">{group.label}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'relative flex items-center gap-2.5 rounded-md py-1.5 pr-2.5 pl-3 text-[13px] transition-colors',
                        'before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-[3px] before:rounded-full',
                        isActive
                          ? 'bg-blue-050 font-medium text-navy-700 before:bg-navy-700'
                          : 'text-grey-700 before:bg-transparent hover:bg-grey-050 hover:text-navy-900',
                      )
                    }
                  >
                    <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-grey-200 p-3">
        <NeedHelpCard />
      </div>
    </aside>
  )
}
