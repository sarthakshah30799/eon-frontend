import type { ReactNode } from 'react';

interface CardSectionProps {
  heading: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
}

const CARD_SECTION_ACCENT = 'oklch(0.5 0.134 242.749)';

export const CardSection = ({
  heading,
  children,
  className = '',
  headerActions,
}: CardSectionProps) => {
  return (
    <section
      className={[
        'rounded-xl border border-sky-100 bg-white p-3 shadow-none',
        className,
      ].join(' ')}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-start gap-3 text-sm font-semibold uppercase text-black">
          <span
            className="mt-1 h-3 w-1 rounded-full"
            style={{ backgroundColor: CARD_SECTION_ACCENT }}
            aria-hidden="true"
          />
          <span>{heading}</span>
        </h2>
        {headerActions ? <div className="shrink-0">{headerActions}</div> : null}
      </div>
      {children}
    </section>
  );
};

export default CardSection;
