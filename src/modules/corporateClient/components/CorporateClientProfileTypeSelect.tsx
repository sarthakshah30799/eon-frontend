import { Label } from '@/components/ui';

interface CorporateClientProfileTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  disabled?: boolean;
}

export const CorporateClientProfileTypeSelect = ({
  value,
  onChange,
  options,
  label = 'Profile Type',
  disabled = false,
}: CorporateClientProfileTypeSelectProps) => {
  return (
    <div className="space-y-1">
      <Label htmlFor="corporate-client-profile-type">{label}</Label>
      <select
        id="corporate-client-profile-type"
        value={value}
        disabled={disabled}
        onChange={event => onChange(event.target.value)}
        className="min-h-7.5 block w-full rounded-md border border-slate-400 bg-surface-primary px-3 py-1 text-[14px] text-text-primary shadow-none placeholder:text-text-tertiary focus:border-slate-500! focus:ring-slate-500 focus-visible:border-transparent! focus-visible:outline-slate-500 focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CorporateClientProfileTypeSelect;
