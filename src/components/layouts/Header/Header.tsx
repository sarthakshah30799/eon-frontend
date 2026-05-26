import { Button } from '../../ui/button1/Button';

interface HeaderProps {
  userName: string;
  onMenuClick: () => void;
  onLogout: () => void | Promise<void>;
}

export const Header = ({ userName, onMenuClick, onLogout }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-20 border-b border-border-primary/80 bg-surface-primary/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open sidebar"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border-primary bg-surface-primary text-text-secondary shadow-sm transition hover:bg-primary-50 lg:hidden"
            onClick={onMenuClick}
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border-primary bg-surface-primary px-3 py-2 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-text-inverse">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
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
              <p className="text-sm font-semibold text-text-primary">Admin</p>
              <p className="text-xs text-text-tertiary">{userName}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onLogout}
            className="border-border-secondary text-text-secondary hover:bg-primary-50"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
