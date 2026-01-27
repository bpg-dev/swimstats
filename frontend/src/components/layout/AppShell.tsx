import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { CourseFilterToggle } from './CourseFilterToggle';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface AppShellProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Personal Bests',
    href: '/personal-bests',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
  },
  {
    label: 'Add Times',
    href: '/add-times',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    ),
  },
  {
    label: 'All Times',
    href: '/all-times',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: 'Meets',
    href: '/meets',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: 'Progress',
    href: '/progress',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
        />
      </svg>
    ),
  },
  {
    label: 'Compare',
    href: '/compare',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    label: 'Standards',
    href: '/standards',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
];

/**
 * Main application shell with navigation.
 */
export function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, canWrite, logout, isAuthenticated } = useAuthStore();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 122.88 82.13">
                  <path d="M0,66.24c7.11-2.74,13.1-0.95,21.42,1.55c2.17,0.65,4.53,1.36,6.66,1.92c1.9,0.5,4.82-0.58,7.88-1.71 c3.82-1.41,7.8-2.87,12.57-2.75c3.6,0.09,6.63,1.74,9.69,3.41c1.92,1.05,3.87,2.11,4.95,2.15c1.24,0.04,3.08-1.04,4.92-2.12 c3-1.77,6-3.54,10.17-3.68c4.48-0.15,7.95,1.39,11.39,2.92c1.96,0.87,3.91,1.74,5.54,1.86c1.54,0.12,3.6-1.2,5.6-2.47 c2.78-1.78,5.51-3.52,9.1-3.92c4.27-0.47,8.93,1.54,12.89,3.24l0.1,0.05c0,4.05,0,8.11,0,12.16c-0.85-0.25-1.73-0.59-2.64-0.96 c-0.63-0.26-1.28-0.54-1.94-0.82c-2.71-1.16-5.9-2.54-7.17-2.4c-1.02,0.11-2.63,1.14-4.27,2.19c-0.6,0.38-1.21,0.77-1.82,1.15 c-3.04,1.85-6.34,3.43-10.69,3.1c-3.54-0.27-6.42-1.55-9.31-2.84l-0.25-0.11c-2.16-0.96-4.33-1.89-6.17-1.83 c-1.13,0.04-2.75,0.95-4.39,1.91l-0.38,0.22c-3.25,1.92-6.51,3.84-11.08,3.67c-3.73-0.14-6.87-1.84-9.96-3.53l-0.39-0.21 c-1.72-0.94-3.37-1.8-4.16-1.82c-2.42-0.06-5.21,0.91-7.92,1.91l-0.47,0.17c-4.74,1.75-9.26,3.41-14.62,2.01 c-2.88-0.75-5.06-1.41-7.06-2.01l-0.06-0.02c-7.25-2.18-11.98-3.58-17.65,0.13c-0.15,0.1-0.31,0.2-0.47,0.31v-0.31V66.24L0,66.24z M87.91,17.06l14.16-2.15c8.81-1.32,6.16-17.18-5.13-14.64l-32.11,5.3c-3.48,0.57-9.45,1.01-12.05,3.33 c-1.49,1.33-2.11,3.18-1.77,5.49c0.48,3.27,3.21,7.37,4.85,10.34l3.97,7.14c2.89,5.19,4.44,5.69-0.91,8.56L22.45,59.99l2.67,0.79 l8.01,0.12c0.91-0.3,1.86-0.65,2.83-1.01c3.82-1.41,7.8-2.87,12.57-2.75c3.6,0.09,6.63,1.74,9.69,3.41l1.38,0.74l7.06,0.11 c0.47-0.26,0.95-0.54,1.42-0.82c3-1.77,6-3.54,10.17-3.68c4.48-0.15,7.95,1.39,11.39,2.92c1.96,0.87,3.91,1.74,5.54,1.86 c0.37,0.03,0.77-0.03,1.19-0.14L77.79,28.5c-1.58-2.81-4.42-6.36-4.01-8.5c0.14-0.72,1.1-1.01,2.27-1.19 C80.01,18.24,83.95,17.66,87.91,17.06L87.91,17.06z M103.21,24.42c7.77,0,14.07,6.3,14.07,14.07c0,7.77-6.3,14.07-14.07,14.07 c-7.77,0-14.07-6.3-14.07-14.07C89.15,30.71,95.44,24.42,103.21,24.42L103.21,24.42z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-slate-900">SwimStats</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {/* Primary navigation group */}
              <div className="flex items-center gap-0.5">
                {navItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive(item.href)
                        ? 'bg-cyan-50 text-cyan-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Analytics navigation group */}
              <div className="flex items-center gap-0.5 pl-8 border-l-2 border-slate-300">
                {navItems.slice(4).map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive(item.href)
                        ? 'bg-cyan-50 text-cyan-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Course filter */}
              <div className="hidden lg:flex px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg shadow-sm">
                <CourseFilterToggle />
              </div>

              {/* User menu */}
              {isAuthenticated && user && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                  <Link
                    to="/settings"
                    className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all"
                    title="Settings"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </Link>
                  {!canWrite() && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium">
                      View Only
                    </span>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all"
                    title="Sign out"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {/* Main navigation */}
              <div className="space-y-1">
                {navItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-cyan-50 text-cyan-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Analytics group */}
              <div className="pt-3 pb-2 space-y-1 border-t border-slate-200">
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Analytics
                </p>
                {navItems.slice(4).map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-cyan-50 text-cyan-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Settings and course filter */}
              <div className="pt-3 space-y-3 border-t border-slate-200">
                <Link
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive('/settings')
                      ? 'bg-cyan-50 text-cyan-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </Link>
                <div className="px-3">
                  <div className="flex justify-center p-3 bg-slate-50 rounded-lg">
                    <CourseFilterToggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500">
            SwimStats - Track Your Swimming Progress
          </p>
          <p className="text-center text-xs text-slate-400 mt-1">
            v{__APP_VERSION__} ({__GIT_COMMIT__})
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
