import type { ReactNode } from 'react';

interface CardSectionProps {
  heading: string;
  children: ReactNode;
  className?: string;
}

const CARD_SECTION_ACCENT = 'oklch(0.5 0.134 242.749)';

export const CardSection = ({
  heading,
  children,
  className = '',
}: CardSectionProps) => {
  return (
    <section
      className={[
        'rounded-xl border border-sky-100 bg-white p-3 shadow-none',
        className,
      ].join(' ')}
    >
      <h2 className="mb-3 flex items-start gap-3 text-sm font-semibold uppercase text-black">
        <span
          className="mt-1 h-3 w-1 rounded-full"
          style={{ backgroundColor: CARD_SECTION_ACCENT }}
          aria-hidden="true"
        />
        <span>{heading}</span>
      </h2>
      {children}
    </section>
  );
};

export default CardSection;
