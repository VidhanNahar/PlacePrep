import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { AuthModal } from '../modals/AuthModal';
import {
  Compass,
  Building2,
  HelpCircle,
  BarChart3,
  PenSquare,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isModerator, logout, loginAsDevUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Experiences', path: '/experiences', icon: Compass },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Question Bank', path: '/questions', icon: HelpCircle },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-[1.5px] shadow-glow">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                    Place<span className="text-indigo-400">Prep</span>
                  </span>
                  <span className="hidden sm:block text-[10px] text-slate-400 -mt-1 font-medium tracking-wider uppercase">
                    Campus Placement Hub
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/40'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side CTA & User Profile */}
            <div className="hidden md:flex items-center gap-3">
              {/* Submit Experience CTA */}
              <Link to="/submit">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<PenSquare className="w-4 h-4" />}
                >
                  Share Experience
                </Button>
              </Link>

              {/* Moderator Portal Link */}
              {isModerator && (
                <Link to="/admin">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-700/50 text-amber-300 bg-amber-950/30 hover:bg-amber-950/60"
                    leftIcon={<ShieldCheck className="w-4 h-4 text-amber-400" />}
                  >
                    Moderation
                  </Button>
                </Link>
              )}

              {/* Auth status */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-medium text-slate-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-300">
                      {user.fullName.charAt(0)}
                    </div>
                    <span className="max-w-[120px] truncate">{user.fullName}</span>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-rose-400"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Dev switcher helper button for quick local evaluation */}
                  <div className="dropdown relative group">
                    <button className="text-xs text-slate-400 hover:text-indigo-300 px-2 py-1 bg-slate-900/80 border border-slate-800 rounded">
                      Demo Logins ▾
                    </button>
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-2 w-48 z-50">
                      <button
                        onClick={() => loginAsDevUser('STUDENT')}
                        className="w-full text-left text-xs px-2 py-1.5 hover:bg-slate-800 rounded text-slate-300"
                      >
                        🎓 Student (Aarav)
                      </button>
                      <button
                        onClick={() => loginAsDevUser('MODERATOR')}
                        className="w-full text-left text-xs px-2 py-1.5 hover:bg-slate-800 rounded text-amber-300"
                      >
                        🛡️ Moderator (Priya)
                      </button>
                      <button
                        onClick={() => loginAsDevUser('ADMIN')}
                        className="w-full text-left text-xs px-2 py-1.5 hover:bg-slate-800 rounded text-purple-300"
                      >
                        👑 Super Admin
                      </button>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAuthModalOpen(true)}
                    leftIcon={<User className="w-4 h-4" />}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <Icon className="w-5 h-5 text-indigo-400" />
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link to="/submit" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full" leftIcon={<PenSquare className="w-4 h-4" />}>
                  Share Experience
                </Button>
              </Link>
              {!isAuthenticated && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                >
                  Sign In / Register
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
