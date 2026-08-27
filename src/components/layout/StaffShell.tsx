import {
  Bell,
  CalendarDays,
  ChevronDown,
  Clock,
  HelpCircle,
  LogOut,
  Menu,
  RefreshCcw,
  X,
} from 'lucide-react'
import { Suspense, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { GrievanceLauncher } from '@/components/common/GrievanceLauncher'
import { Modal } from '@/components/common/Modal'
import { Banner, Button } from '@/components/common/primitives'
import { SkeletonCards } from '@/components/common/states'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { resetDb, seed } from '@/mock/api'
import { ROLES, type PortalId } from '@/rbac/roles'
import { cn } from '@/utils/cn'
import { AccessibilityControls } from './AccessibilityControls'
import { GovBrand } from './Emblem'
import { NeedHelpCard } from './NeedHelpCard'
import { PORTAL_ACCENT, PORTAL_NAV, PORTAL_SUBTITLE, PORTAL_TITLE } from './navigation'

/**
 * Shell B — staff portals.
 *
 * "navy header with role chip (name + role + ID) on the right, left sidebar
 * with grouped nav, breadcrumb row under the header, content grid below."
 */
export function StaffShell({ portal }: { portal: PortalId }) {
  const { staff, roleLabel, can, logout, portals } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const accent = PORTAL_ACCENT[portal]

  const groups = PORTAL_NAV[portal]
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => can(item.permission)),
    }))
    .filter((group) => group.items.length > 0)

  const crumbs = buildCrumbs(location.pathname)

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={cn(
          'sticky top-0 z-30 text-white',
          accent === 'purple' ? 'bg-purple-600' : 'bg-navy-900',
        )}
      >
        <div className="flex items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-white/10 lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>

          <GovBrand />

          <div className="mx-auto hidden min-w-0 max-w-md text-center 2xl:block">
            <h1 className="clamp-1 text-[18px] leading-tight font-semibold tracking-wide">
              {PORTAL_TITLE[portal]}
            </h1>
            <p className="clamp-1 text-[12px] text-white/75">{PORTAL_SUBTITLE[portal]}</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 text-[12px] text-white/80 xl:flex">
              <CalendarDays className="size-3.5" />
              20-May-2024
              <Clock className="ml-2 size-3.5" />
              {seed.DEMO_NOW}
            </span>

            <AccessibilityControls />

            <button
              type="button"
              onClick={() => setAlertsOpen(true)}
              className="relative rounded-md p-1.5 hover:bg-white/10"
              aria-label={`Notifications (${seed.alerts.length} unread)`}
            >
              <Bell className="size-4" />
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold">
                {seed.alerts.length}
              </span>
            </button>

            <a
              href="#need-help"
              className="rounded-md p-1.5 hover:bg-white/10"
              aria-label="Help"
            >
              <HelpCircle className="size-4" />
            </a>

            {/* Role chip: name + role + ID, per the shell spec. */}
            <div className="flex items-center gap-2 rounded-md py-1 pr-1 pl-2 hover:bg-white/10">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-[12px] font-semibold">
                {staff?.initials}
              </span>
              <span className="hidden max-w-44 min-w-0 text-left leading-tight sm:block">
                <span className="clamp-1 block text-[13px] font-medium">{staff?.name}</span>
                <span className="clamp-1 block text-[11px] text-white/70">
                  {roleLabel} · {staff?.employeeId}
                </span>
              </span>
              <ChevronDown className="size-3.5 text-white/70" />
            </div>

            <button
              type="button"
              onClick={() => {
                logout()
                navigate(ROUTES.LOGIN)
              }}
              className="rounded-md p-1.5 hover:bg-white/10"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar
          groups={groups}
          portal={portal}
          otherPortals={portals.filter((item) => item !== portal)}
          className="sticky top-[57px] h-[calc(100vh-57px)] w-[232px] shrink-0 border-r border-grey-200 bg-white max-lg:hidden"
        />

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-navy-900/40"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative h-full w-72 overflow-y-auto bg-white">
              <div className="flex justify-end p-2">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-md p-1.5 text-grey-600 hover:bg-grey-100"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
              <Sidebar
                groups={groups}
                portal={portal}
                otherPortals={portals.filter((item) => item !== portal)}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <nav aria-label="Breadcrumb" className="border-b border-grey-200 bg-white px-4 py-1.5 sm:px-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-grey-600">
              {crumbs.map((crumb, index) => (
                <li key={crumb} className="flex items-center gap-1.5">
                  {index > 0 && <span className="text-grey-300">›</span>}
                  <span className={cn(index === crumbs.length - 1 && 'font-medium text-navy-700')}>
                    {crumb}
                  </span>
                </li>
              ))}
            </ol>
          </nav>

          <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
            <Suspense fallback={<SkeletonCards />}>
              <Outlet />
            </Suspense>
          </main>

          <Footer />
        </div>
      </div>

      <GrievanceLauncher />

      <Modal
        open={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        title="Notifications"
        description="Workflow alerts and system messages for your office."
      >
        <ul className="divide-y divide-grey-200">
          {seed.alerts.map((alert) => (
            <li key={alert.id} className="flex gap-3 py-3">
              <span
                className={cn(
                  'mt-1 size-2 shrink-0 rounded-full',
                  {
                    info: 'bg-blue-500',
                    success: 'bg-green-600',
                    warning: 'bg-amber-500',
                    danger: 'bg-red-600',
                  }[alert.tone],
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-navy-900">{alert.text}</p>
                <p className="text-[12px] text-grey-600">{alert.timestamp}</p>
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  )
}

function Sidebar({
  groups,
  portal,
  otherPortals,
  className,
  onNavigate,
}: {
  groups: { label?: string; items: { label: string; to: string; icon: React.ElementType; end?: boolean }[] }[]
  portal: PortalId
  otherPortals: PortalId[]
  className?: string
  onNavigate?: () => void
}) {
  const accent = PORTAL_ACCENT[portal]

  return (
    <aside className={cn('flex flex-col', className)}>
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {groups.map((group, index) => (
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
                          ? accent === 'purple'
                            ? 'bg-purple-050 font-medium text-purple-600 before:bg-purple-600'
                            : 'bg-blue-050 font-medium text-navy-700 before:bg-navy-700'
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

        {otherPortals.length > 0 && <PortalSwitcher portals={otherPortals} onNavigate={onNavigate} />}
      </nav>

      <div id="need-help" className="border-t border-grey-200 p-3">
        <NeedHelpCard />
        <DemoResetButton />
      </div>
    </aside>
  )
}

function PortalSwitcher({ portals, onNavigate }: { portals: PortalId[]; onNavigate?: () => void }) {
  const homeRoute: Record<PortalId, string> = {
    candidate: ROUTES.CANDIDATE_DASHBOARD,
    department: ROUTES.DEPT_DASHBOARD,
    'exam-admin': ROUTES.EA_DASHBOARD,
    evaluator: ROUTES.EV_DASHBOARD,
    admin: ROUTES.AD_DASHBOARD,
    invigilator: ROUTES.IN_DASHBOARD,
    helpdesk: ROUTES.HD_DASHBOARD,
    finance: ROUTES.FI_INBOX,
  }

  return (
    <div className="mt-4">
      <p className="label-caps mb-1.5 border-b border-grey-200 px-2 pb-1.5">Other portals</p>
      <ul className="space-y-0.5">
        {portals.map((portal) => (
          <li key={portal}>
            <NavLink
              to={homeRoute[portal]}
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-grey-600 hover:bg-grey-050 hover:text-navy-900"
            >
              <span className="size-4 shrink-0 rounded bg-grey-200" />
              <span className="truncate">{ROLES['super-admin'] && portalLabel(portal)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

function portalLabel(portal: PortalId) {
  return {
    candidate: 'Candidate Portal',
    department: 'Department Portal',
    'exam-admin': 'Exam Admin Portal',
    evaluator: 'Evaluator Portal',
    admin: 'Admin Portal',
    invigilator: 'Centre Functionary',
    helpdesk: 'Helpdesk Console',
    finance: 'Finance Concurrence',
  }[portal]
}

function DemoResetButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full justify-start text-grey-600"
        onClick={() => setOpen(true)}
      >
        <RefreshCcw className="size-3.5" />
        Reset demo data
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Reset demo data?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDb()
                window.location.href = ROUTES.LOGIN
              }}
            >
              Reset and sign out
            </Button>
          </>
        }
      >
        <Banner tone="warning">
          Every change made in this session — scrutiny decisions, requisition approvals, ticket
          locks, marks entered — is discarded and the seeded data is restored.
        </Banner>
      </Modal>
    </>
  )
}

function buildCrumbs(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean)
  return [
    'Home',
    ...segments.map((segment) =>
      segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase())
        .replace(/^Ea /, ''),
    ),
  ]
}

export function Footer() {
  return (
    <footer className="no-print border-t border-grey-200 bg-navy-900 px-4 py-3 text-white sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[12px]">
        <p className="text-white/75">© 2024 Government of Puducherry. All rights reserved.</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-white/85">
          {['Home', 'FAQ', 'User Manual', 'Contact Us', 'Terms & Conditions', 'Privacy Policy'].map(
            (item) => (
              <li key={item}>
                <a href="#top" className="hover:text-white">
                  {item}
                </a>
              </li>
            ),
          )}
        </ul>
      </div>
    </footer>
  )
}
