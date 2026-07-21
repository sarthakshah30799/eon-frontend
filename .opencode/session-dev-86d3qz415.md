# Session: dev-86d3qz415

## Scope

Dashboard page refactor — replace inline SVGs, extract custom hook, split into reusable components, fix scrollability.

## Completed

- Replaced all inline SVG icons with `@heroicons/react/24/outline`
- Created `src/pages/dashboard/hooks/useDashboard.ts` — all 6 `useQuery` calls + computed state (`volumeTrend`, `txnTrend`, `chartVolume`)
- Created components:
  - `StatCard` — card with icon, label, value, trend indicator, children slot
  - `VolumeChart` — reusable recharts `AreaChart` via props (`data`, `loading`, `days`, `onDaysChange`)
  - `VolumeSlider` — CSS-animated auto-slider for volume by currency
  - `RecentTransactionsTable` — table with `Button` component for "View All"
  - `PendingApprovals` — scrollable list (`max-h-[280px] overflow-y-auto`)
  - `LiveRates` — scrollable list (`max-h-[300px] overflow-y-auto`)
- DashboardPage is now thin — only renders JSX, no data logic
- `formatCurrency`/`formatCompact` utilities exported from hook file
- `tsc --noEmit` and `eslint --fix` both pass

## Created Files

- `src/pages/dashboard/hooks/useDashboard.ts`
- `src/pages/dashboard/components/StatCard.tsx`
- `src/pages/dashboard/components/VolumeChart.tsx`
- `src/pages/dashboard/components/VolumeSlider.tsx`
- `src/pages/dashboard/components/RecentTransactionsTable.tsx`
- `src/pages/dashboard/components/PendingApprovals.tsx`
- `src/pages/dashboard/components/LiveRates.tsx`

## Modified Files

- `src/pages/dashboard/DashboardPage.tsx` — gutted, now imports hook + components

## AGENTS.md

- Created at project root with coding rules (custom hooks, one component per file, reusable charts, existing UI components, Heroicons for icons)
