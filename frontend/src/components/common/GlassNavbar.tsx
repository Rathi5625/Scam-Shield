import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { familyRepository } from '../../services/family/LocalFamilyProtectionRepository';
import { BrandEmblem } from './BrandEmblem';
import { ThemeToggle } from './ThemeToggle';

interface GlassNavbarProps {
  backendMode?: string;
}

export const GlassNavbar: React.FC<GlassNavbarProps> = ({ backendMode = 'MOCK' }) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLockdownActive, setIsLockdownActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      familyRepository.getFamilyGroup(user.id).then((g) => {
        setIsLockdownActive(g?.emergencyLockdownActive ?? false);
      });
    } else {
      setIsLockdownActive(false);
    }
  }, [user]);

  // Close mobile menu on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = isAuthenticated
    ? [
        { name: 'Scan', path: '/scan' },
        { name: 'History', path: '/history' },
        { name: 'Family Protection', path: '/family-protection' },
        { name: 'Settings', path: '/settings' },
      ]
    : [
        { name: 'Scan', path: '/scan' },
        { name: 'How It Works', path: '/#how-it-works' },
        { name: 'Protection', path: '/#protection' },
        { name: 'About', path: '/#about' },
      ];

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'SS';

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 lg:px-8 pointer-events-none">
      <div className="w-full max-w-[1280px] h-16 rounded-full ss-navbar flex items-center justify-between px-4 lg:px-6 pointer-events-auto relative">
        {/* Brand Logo & Name (Stitch Asset 35b323287c9a4416941b34f0933e57b3) */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <BrandEmblem size={32} className="group-hover:scale-105 transition-transform duration-300" />
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold tracking-tight text-color-offwhite">
                ScamShield
              </span>
              <span className="hidden sm:inline-block font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-color-crimson/20 text-crimson-light border border-color-crimson/30 tracking-wider font-semibold">
                {backendMode} SENTRY
              </span>
            </div>
          </Link>
        </div>

        {/* Central Navigation Pills (Stitch Rounded Navigation Module) */}
          <nav className="hidden md:flex items-center gap-1 rounded-full p-1 shadow-inner ss-nav-pill-container">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-[#F5F2ED] bg-[#8B0D1A] shadow-[0_2px_10px_rgba(139,13,26,0.6),inset_0_1px_0_rgba(255,255,255,0.25)] font-semibold'
                    : 'text-muted-foreground hover:text-on-surface hover:bg-surface-container-high/40'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Cluster: Global Theme Switcher + Profile / Sign In */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Theme Toggle */}
          <ThemeToggle />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-container-high/60 border border-glass-border hover:border-primary/40 transition"
              >
                <div className="relative flex items-center rounded-full p-0.5">
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-color-offwhite text-xs font-mono font-bold">
                    {initials}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-1 ring-background ${
                      isLockdownActive ? 'bg-color-crimson animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-mono font-medium text-color-offwhite leading-tight max-w-[120px] truncate">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                  <span
                    className={`text-[9px] font-mono tracking-wider uppercase font-semibold ${
                      isLockdownActive ? 'text-crimson-light animate-pulse' : 'text-emerald-500 dark:text-emerald-400'
                    }`}
                  >
                    {isLockdownActive ? 'LOCKDOWN' : 'SECURE'}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                title="Sign out of operative session"
                className="p-2 rounded-full bg-surface-container-high/60 border border-glass-border text-muted-foreground hover:text-color-crimson hover:border-crimson/40 transition cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-on-surface transition"
              >
                <LogIn className="w-3.5 h-3.5 mr-1 text-primary inline" />
                <span>Log In</span>
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-xs font-mono font-semibold text-white transition shadow-[0_0_20px_-3px_rgba(139,13,26,0.35),inset_0_1px_1px_0_rgba(245,242,237,0.25)] flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-surface-container-high/60 border border-glass-border text-muted-foreground hover:text-on-surface transition"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-24 inset-x-4 p-4 rounded-2xl glass-panel border border-glass-border bg-surface-container-lowest/95 backdrop-blur-2xl shadow-2xl space-y-3 pointer-events-auto">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-xs font-mono font-medium transition ${
                    isActive
                      ? 'bg-primary text-white font-bold'
                      : 'text-muted-foreground hover:text-on-surface hover:bg-surface-container-high/40'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {!isAuthenticated && (
            <div className="pt-2 border-t border-glass-border flex items-center gap-2">
              <Link
                to="/login"
                className="w-full py-2 text-center text-xs font-mono rounded-lg border border-glass-border text-muted-foreground hover:text-on-surface"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="w-full py-2 text-center text-xs font-mono rounded-lg bg-primary text-white font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
