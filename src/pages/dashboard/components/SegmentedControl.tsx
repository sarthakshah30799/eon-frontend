interface SegmentedControlOption {
  value: string | number;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string | number;
  onChange: (value: string | number) => void;
}

const SegmentedControl = ({ options, value, onChange }: SegmentedControlProps) => (
  <div className="flex gap-1 rounded-md border border-border-primary bg-surface-secondary p-0.5">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={
          'rounded-sm px-2 py-1 text-xs font-medium transition-colors ' +
          (value === opt.value
            ? 'bg-primary-500 text-text-inverse'
            : 'text-text-secondary hover:text-text-primary')
        }
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export default SegmentedControl;
