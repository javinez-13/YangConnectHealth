'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Calendar, LogOut, Menu, X,
  Building2, CalendarDays, FileText, User
} from 'lucide-react';
import Image from 'next/image';
import yangLogo from '../../frontend/assets/yanglogo.jpg';
import { getUser, logout } from '../../lib/auth';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/logs', label: 'System Logs', icon: Users },
    { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { href: '/admin/scheduling', label: 'Scheduling', icon: CalendarDays },
    { href: '/admin/facilities', label: 'Facilities', icon: Building2 },
    { href: '/admin/events', label: 'Events & Content', icon: FileText },
    { href: '/admin/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-primary text-white shadow-lg z-40">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <Image src={yangLogo} alt="YangConnect HealthPortal logo" className="h-8 w-8 rounded-full object-cover" />
            <span className="ml-2 text-xl font-bold">YangConnect HealthPortal</span>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/20">
          <div className="flex items-center mb-4">
            <div>
              <p className="font-semibold">{user?.first_name} {user?.last_name}</p>
              <p className="text-sm text-white/70">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-white/80 hover:text-white w-full px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-primary text-white p-2 rounded-lg"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-64 bg-primary text-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <Image src={yangLogo} alt="YangConnect HealthPortal logo" className="h-8 w-8 rounded-full object-cover" />
                  <span className="ml-2 text-xl font-bold">YangConnect HealthPortal</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="md:ml-64 p-6">
        {children}
      </main>
    </div>
  );
}

