import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../ui/button1/Button';
import { menuApi } from '../../../api';

interface HeaderProps {
  userName: string;
  onLogout: () => void | Promise<void>;
}

// Sleek, minimal Lucide-style SVG icon resolver for a premium look
const getIcon = (iconName?: string | null) => {
  switch (iconName) {
    case 'building':
      return (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'map-pin':
      return (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'shield':
      return (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'users':
      return (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'settings':
      return (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

export const Header = ({ userName, onLogout }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic menu from backend
  const { data: menuTree = [] } = useQuery({
    queryKey: ['menu-tree'],
    queryFn: async () => {
      const response = await menuApi.getMenuTree();
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
  });

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleNavigate = (path?: string | null) => {
    if (path) {
      navigate(path);
    }
    setActiveMenuId(null);
  };

  return (
    <header 
      ref={dropdownRef}
      className="sticky top-0 z-30 border-b border-border-primary bg-surface-primary/90 backdrop-blur-md shadow-sm"
    >
      <div className="flex h-16 items-center justify-between gap-4 px-6 py-3">
        {/* Left Section: Logo & Top-Level Menus */}
        <div className="flex items-center gap-10">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 select-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-md">
              <img src="/favicon.svg" alt="Maraekat logo" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
                Currency Exchange
              </p>
              <p className="text-sm font-bold text-text-primary leading-tight">
                Maraekat FX
              </p>
            </div>
          </div>

          {/* Horizontal Navigation Tabs */}
          <nav className="relative flex items-center gap-1">
            {menuTree.map((root) => {
              const isOpen = activeMenuId === root.id;

              // Check if any leaf page under this top-level category is active
              const isTabActive = root.children?.some(group => 
                group.children?.some(item => 
                  item.path && (location.pathname === item.path || location.pathname.startsWith(item.path + '/'))
                )
              );

              return (
                <div key={root.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenuId(isOpen ? null : root.id)}
                    className={[
                      'flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none cursor-pointer',
                      isOpen 
                        ? 'bg-primary-50 text-primary-600 shadow-[0_2px_10px_-3px_rgba(59,130,246,0.15)]' 
                        : isTabActive
                          ? 'bg-primary-50/40 text-primary-600'
                          : 'text-text-secondary hover:bg-secondary-50 hover:text-text-primary'
                    ].join(' ')}
                  >
                    <span>{root.name}</span>
                    <svg
                      className={[
                        'h-4 w-4 transform transition-transform duration-200',
                        isOpen ? 'rotate-180 text-primary-600' : isTabActive ? 'text-primary-500' : 'text-text-tertiary'
                      ].join(' ')}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Waterfall Dropdown Panel */}
                  {isOpen && root.children && root.children.length > 0 && (
                    <div className={[
                      'absolute top-full left-0 mt-2 origin-top-left rounded-2xl border border-border-primary/60 bg-white/95 backdrop-blur-xl p-4 shadow-[0_20px_50px_rgba(59,130,246,0.12)] border border-slate-100/80 animate-in fade-in slide-in-from-top-2 duration-150 z-40',
                      root.children.length <= 1 ? 'w-80' : root.children.length === 2 ? 'w-[36rem]' : 'w-[50rem]'
                    ].join(' ')}>
                      <div className={[
                        'grid gap-6',
                        root.children.length <= 1 ? 'grid-cols-1' : root.children.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                      ].join(' ')}>
                        {root.children.map((group) => (
                          <div key={group.id} className="flex flex-col">
                            {/* Group Section Header (e.g. System Setup) */}
                            <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary border-b border-border-primary/30 mb-2">
                              <span>{group.name}</span>
                            </div>

                            {/* Group Leaf Links (e.g. Company Profile, User Profile) */}
                            <div className="space-y-1">
                              {group.children?.map((item) => {
                                const isItemActive = item.path && (
                                  location.pathname === item.path || 
                                  location.pathname.startsWith(item.path + '/')
                                );

                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleNavigate(item.path)}
                                    className={[
                                      'group flex w-full items-center gap-3 rounded-xl py-2 px-3 text-left text-sm font-medium transition-all duration-200 cursor-pointer',
                                      isItemActive
                                        ? 'bg-primary-50 text-primary-700 font-semibold shadow-[0_2px_8px_-2px_rgba(59,130,246,0.12)]'
                                        : 'text-text-secondary hover:bg-primary-50/50 hover:text-primary-600 hover:translate-x-1.5'
                                    ].join(' ')}
                                  >
                                    <div className={[
                                      'flex items-center justify-center rounded-lg p-1.5 transition-all duration-200',
                                      isItemActive
                                        ? 'bg-primary-100 text-primary-600 shadow-sm'
                                        : 'bg-secondary-50 text-text-tertiary group-hover:bg-primary-100 group-hover:text-primary-600'
                                    ].join(' ')}>
                                      {getIcon(item.icon)}
                                    </div>
                                    <span className="truncate">{item.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right Section: User Info & Logout */}
        <div className="flex items-center gap-4">
          {/* User Profile Info Card */}
          <div className="flex items-center gap-3 rounded-2xl border border-border-primary bg-surface-primary px-3 py-1.5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-text-inverse shadow-sm">
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 21a8 8 0 10-16 0m16 0a8 8 0 00-16 0m16 0H4m8-11a4 4 0 100-8 4 4 0 000 8z"
                />
              </svg>
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-text-primary leading-tight">Admin</p>
              <p className="text-[10px] text-text-tertiary max-w-[140px] truncate">{userName}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onLogout}
            className="border-border-secondary text-text-secondary hover:bg-primary-50 hover:text-text-primary rounded-xl cursor-pointer"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
