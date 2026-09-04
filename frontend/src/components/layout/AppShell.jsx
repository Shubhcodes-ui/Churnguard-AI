import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  BrainCircuit, 
  PieChart, 
  ShieldCheck, 
  Settings,
  LogOut,
  Menu,
  X,
  Command,
  Shield,
  Activity
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ConnectionBanner } from '@/components/common/ConnectionBanner';
import { CommandPalette } from '@/components/common/CommandPalette';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Predict', path: '/predict', icon: BrainCircuit },
  { name: 'Segments', path: '/segments', icon: PieChart },
  { name: 'Retention', path: '/retention', icon: ShieldCheck },
  { name: 'Models', path: '/models', icon: Settings },
];

export default function AppShell() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Find page title from route
  const currentNav = navItems.find(item => 
    item.path === '/' 
      ? location.pathname === '/' 
      : location.pathname.startsWith(item.path)
  );
  const pageTitle = currentNav?.name || 'Dashboard';

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cg-brand text-cg-base flex items-center justify-center font-extrabold shadow-lg shadow-cg-brand/20">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-cg-primary">ChurnGuard AI</span>
              <span className="block text-[10px] font-mono text-cg-brand tracking-wider uppercase font-semibold">Enterprise</span>
            </div>
          </div>
          {mobileDrawerOpen && (
            <button 
              onClick={() => setMobileDrawerOpen(false)}
              className="md:hidden text-cg-muted hover:text-cg-primary p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative text-sm font-medium ${
                  isActive 
                    ? 'text-cg-brand bg-cg-brand/10 font-semibold' 
                    : 'text-cg-muted hover:text-cg-primary hover:bg-cg-base/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 top-1 bottom-1 w-1 bg-cg-brand rounded-r-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-cg-brand' : 'text-cg-muted'}`} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="pt-4 border-t border-cg-border space-y-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-cg-base/50 border border-cg-border">
          <div className="w-8 h-8 rounded-full bg-cg-surface border border-cg-border flex items-center justify-center text-xs font-bold text-cg-brand">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-cg-primary truncate">{user?.full_name || 'Risk Analyst'}</p>
            <p className="text-[11px] font-mono text-cg-muted truncate">{user?.email || 'analyst@churnguard.ai'}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-cg-muted hover:text-cg-risk hover:bg-cg-risk/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-cg-base text-cg-primary overflow-hidden font-sans">
      <CommandPalette isOpen={paletteOpen} onClose={setPaletteOpen} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[240px] flex-shrink-0 border-r border-cg-border bg-cg-surface flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            {/* Drawer Content */}
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-[260px] max-w-[85vw] h-full bg-cg-surface border-r border-cg-border z-50 flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main App Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ConnectionBanner />

        {/* Global Header */}
        <header className="h-16 border-b border-cg-border flex items-center justify-between px-4 sm:px-6 bg-cg-base/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg text-cg-muted hover:text-cg-primary hover:bg-cg-surface border border-cg-border"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cg-muted uppercase tracking-wider hidden sm:inline">Platform</span>
              <span className="text-cg-muted hidden sm:inline">/</span>
              <h1 className="text-base sm:text-lg font-bold text-cg-primary tracking-tight">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cmd+K Search trigger button */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cg-surface border border-cg-border text-xs text-cg-muted hover:text-cg-primary hover:border-cg-brand/40 transition-colors shadow-sm"
            >
              <Command className="w-3.5 h-3.5 text-cg-brand" />
              <span className="hidden sm:inline">Quick Jump</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-cg-base rounded border border-cg-border text-cg-muted">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-cg-base">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
