'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, X, ChevronDown, LogOut, LayoutDashboard, Bell, Globe, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import NotificationPanel from '@/components/dashboard/NotificationPanel';

const getNavItems = (t: (k: string) => string) => [
  { label: t('home'), href: '/' },
  {
    label: t('dreams'), href: '/dreams',
    children: [
      { label: 'Animals', href: '/dreams?cat=animals' },
      { label: 'Nature', href: '/dreams?cat=nature' },
      { label: 'Elements', href: '/dreams?cat=elements' },
      { label: 'All Dreams', href: '/dreams' },
    ],
  },
  {
    label: t('health'), href: '/health',
    children: [
      { label: 'Weight Loss', href: '/health/weight-loss' },
      { label: 'Diabetes Diet', href: '/health/diabetes-diet' },
      { label: 'Digestion', href: '/health/digestion' },
      { label: 'Immunity', href: '/health/immunity' },
    ],
  },
  {
    label: t('ayurveda'), href: '/ayurveda',
    children: [
      { label: 'Ashwagandha', href: '/ayurveda/ashwagandha-benefits-dosage' },
      { label: 'Giloy', href: '/ayurveda/giloy-benefits-immunity' },
      { label: 'All Herbs', href: '/ayurveda' },
    ],
  },
  { label: t('yoga'), href: '/yoga' },
  { label: t('beauty'), href: '/beauty' },
  { label: t('blog'), href: '/blog' },
  { label: t('shop'), href: '/shop' },
];

const TRENDING_SEARCHES = [
  'dream about snake', 'ashwagandha benefits', 'yoga for back pain',
  'dark circles remedies', 'weight loss', 'immunity boosters'
];

export default function Header() {
  const { user, profile, signOut, openAuthModal } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems = getNavItems(t);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const avatarInitial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  const pendingVerifications = (!profile?.email_verified || !profile?.mobile_verified) && !!user;

  return (
    <>
      {/* Top Social Bar */}
      <div className="social-bar py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] text-gray-100">
            <span>{lang === 'hi' ? 'अनुसरण करें:' : 'Follow us:'}</span>
            {['Facebook', 'Instagram', 'YouTube', 'Twitter'].map((s) => (
              <a key={s} href="#" className="hover:text-white transition-colors">{s}</a>
            ))}
          </div>
          <div className="text-[11px] text-gray-100">
            {lang === 'hi' ? 'स्वस्थ मन • स्वस्थ शरीर • सकारात्मक जीवन' : 'Healthy Mind • Healthy Body • Positive Life'}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'shadow-md' : 'border-b border-[#E8E8E8]'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold tracking-tight font-display">
                Veda<span className="text-brand">Well</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link href={item.href} className="flex items-center gap-0.5 px-3 py-2 nav-link text-[11px]">
                    {item.label}
                    {item.children && <ChevronDown size={11} className="mt-0.5 opacity-60" />}
                  </Link>
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 w-48 bg-white border border-[#E8E8E8] shadow-lg z-50 py-1">
                      {item.children.map((child) => (
                        <Link key={child.label} href={child.href} className="block px-4 py-2 text-[12px] text-[#333] hover:text-brand hover:bg-[#FFF8F6] transition-colors">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 border border-[#E8E8E8] text-[11px] font-bold uppercase tracking-wider hover:border-brand hover:text-brand transition-all font-body"
                title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
              >
                <Globe size={12} />
                {lang === 'en' ? 'हिं' : 'EN'}
              </button>

              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:text-brand transition-colors" aria-label="Search">
                <Search size={18} />
              </button>

              <Link href="/cart" className="p-2 hover:text-brand transition-colors relative">
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand text-white text-[9px] rounded-full flex items-center justify-center font-bold">{totalItems > 99 ? '99+' : totalItems}</span>
                )}
              </Link>

              {/* Notification Bell */}
              {user && (
                <button onClick={() => setNotifOpen(true)} className="p-2 hover:text-brand transition-colors relative" aria-label="Notifications">
                  <Bell size={18} />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand text-white text-[9px] rounded-full flex items-center justify-center font-bold">3</span>
                </button>
              )}

              {/* Auth Button / User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 border border-[#E8E8E8] hover:border-brand transition-all"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center font-body">
                        {avatarInitial}
                      </div>
                    )}
                    <span className="text-[12px] font-semibold font-body text-[#111] hidden md:block max-w-[80px] truncate">
                      {profile?.full_name || profile?.username || user.email?.split('@')[0]}
                    </span>
                    {pendingVerifications && (
                      <AlertCircle size={12} className="text-amber-500" />
                    )}
                    <ChevronDown size={12} className="text-[#999]" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-[#E8E8E8] shadow-xl z-50 py-2">
                      <div className="px-4 py-3 border-b border-[#F0F0F0]">
                        <p className="text-sm font-bold text-[#111] font-body truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-[11px] text-[#999] font-body truncate">{user.email}</p>
                        {pendingVerifications && (
                          <div className="mt-2 space-y-1">
                            {!profile?.email_verified && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-600 font-body bg-amber-50 px-2 py-1">
                                <AlertCircle size={10} />
                                {t('email_pending')}
                              </div>
                            )}
                            {!profile?.mobile_verified && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-600 font-body bg-amber-50 px-2 py-1">
                                <AlertCircle size={10} />
                                {t('mobile_pending')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {[
                        { icon: LayoutDashboard, label: t('my_profile'), href: '/dashboard' },
                        { icon: null, label: t('my_orders'), href: '/dashboard/orders' },
                        { icon: null, label: t('my_addresses'), href: '/dashboard/addresses' },
                        { icon: null, label: t('wishlist'), href: '/dashboard/wishlist' },
                        { icon: null, label: t('refund_status'), href: '/dashboard/refunds' },
                        { icon: null, label: t('messages'), href: '/dashboard/messages' },
                      ].map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-[#333] hover:text-brand hover:bg-[#FFF8F6] transition-colors font-body">
                          {item.icon && <item.icon size={14} className="text-[#999]" />}
                          {!item.icon && <div className="w-3.5" />}
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-[#F0F0F0] mt-1 pt-1">
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full font-body"
                        >
                          <LogOut size={14} />
                          {t('logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 bg-green-500 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#C93D0E] transition-colors font-body"
                >
                  {t('login')}
                </button>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 lg:hidden hover:text-brand transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-4 border-t border-[#F0F0F0] pt-3">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] text-sm focus:outline-none focus:border-brand transition-colors font-body"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                    }
                  }}
                />
                {searchQuery.trim() === '' && (
                  <div className="mt-2 flex flex-wrap gap-1 px-2">
                    <span className="text-[10px] text-[#999] flex items-center gap-1 font-body">
                      <TrendingUp size={10} /> Trending:
                    </span>
                    {TRENDING_SEARCHES.map((term) => (
                      <Link
                        key={term}
                        href={`/search?q=${encodeURIComponent(term)}`}
                        onClick={() => setSearchOpen(false)}
                        className="text-[10px] px-2 py-0.5 bg-white border border-[#E8E8E8] text-[#555] hover:border-brand hover:text-brand transition-all font-body"
                      >
                        {term}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#E8E8E8] bg-white max-h-[70vh] overflow-y-auto">
            {/* Mobile Lang Toggle */}
            <div className="px-6 py-3 border-b border-[#F5F5F5] flex items-center justify-between">
              <span className="text-xs text-[#999] font-body">Language</span>
              <button
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-1 px-3 py-1.5 border border-[#E8E8E8] text-xs font-bold text-[#333] hover:border-brand"
              >
                <Globe size={12} />
                {lang === 'en' ? 'हिंदी' : 'English'}
              </button>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:text-brand hover:bg-[#FFF8F6] border-b border-[#F5F5F5] font-body"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <div className="px-6 py-4">
                <button onClick={() => { openAuthModal('login'); setMobileOpen(false); }} className="w-full btn-primary text-center">
                  {t('login')}
                </button>
              </div>
            )}
            {user && (
              <div className="px-6 py-3 border-t border-[#E8E8E8]">
                <Link href="/dashboard" className="block text-sm font-semibold text-[#333] hover:text-brand py-2 font-body" onClick={() => setMobileOpen(false)}>{t('dashboard')}</Link>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="block text-sm font-semibold text-red-600 py-2 font-body">{t('logout')}</button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Notification Panel */}
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
