import type { HTMLAttributes, ReactNode } from 'react';

const SURFACE_PANEL_CLASSNAME =
  'rounded-sm border border-border-primary bg-surface-primary p-2 shadow-sm';

export interface SurfacePanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
}

export const SurfacePanel = ({
  children,
  className = '',
  ...props
}: SurfacePanelProps) => {
  return (
    <section
      className={[SURFACE_PANEL_CLASSNAME, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </section>
  );
};

export default SurfacePanel;
