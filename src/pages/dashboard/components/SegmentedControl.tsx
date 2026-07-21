import { Button } from "@/components/ui/button1";

interface SegmentedControlOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const SegmentedControl = <T extends string | number>({ options, value, onChange }: SegmentedControlProps<T>) => (
  <div className="flex gap-1 rounded-md border border-border-primary bg-surface-secondary p-0.5">
    {options.map((opt) => (
      <Button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
          value === opt.value
            ? "bg-primary-500 text-text-inverse hover:bg-primary-600"
            : "bg-transparent text-text-secondary hover:bg-transparent hover:text-text-primary"
        }`}
      >
        {opt.label}
      </Button>
    ))}
  </div>
);

export default SegmentedControl;
