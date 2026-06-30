import type { Dispatch, SetStateAction } from 'react';
import { Button, Modal } from '@/components/ui';
import type {
  CurrencyRateMarginType,
  ICurrencyRateGroup,
  ICurrencyRateGroupFormValues,
} from '../types/currencyRatesTypes';
import { formatMarginValue } from '../utils/currencyRatesUtils';

interface CurrencyRateGroupModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  form: ICurrencyRateGroupFormValues;
  setForm: Dispatch<SetStateAction<ICurrencyRateGroupFormValues>>;
  selectedGroup: ICurrencyRateGroup | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary';
const inputClass = 'w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500';

export const CurrencyRateGroupModal = ({
  open,
  mode,
  form,
  setForm,
  selectedGroup,
  isSubmitting,
  onSubmit,
  onClose,
}: CurrencyRateGroupModalProps) => {
  return (
    <Modal
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          onClose();
        }
      }}
      title={mode === 'edit' ? 'Edit Currency Group' : 'Create Currency Group'}
      description="Group pricing lives here. Fill only the values you want to store."
      size="xl"
    >
      <div className="space-y-6">
        <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-sm text-text-secondary">
          <div className="font-medium text-text-primary">
            {selectedGroup
              ? `${selectedGroup.code} - ${selectedGroup.name}`
              : 'New group'}
          </div>
          <div className="mt-1">
            {selectedGroup ? 'You are editing this group.' : 'No group is selected yet.'}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Group Code</label>
            <input
              value={form.code}
              onChange={event => setForm(next => ({ ...next, code: event.target.value }))}
              className={inputClass}
              placeholder="MAJOR"
            />
          </div>
          <div>
            <label className={labelClass}>Group Name</label>
            <input
              value={form.name}
              onChange={event => setForm(next => ({ ...next, name: event.target.value }))}
              className={inputClass}
              placeholder="Major"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={event => setForm(next => ({ ...next, description: event.target.value }))}
              className={inputClass}
              rows={2}
            />
          </div>
          <div>
            <label className={labelClass}>Buy Margin Type</label>
            <select
              value={form.buyMarginType}
              onChange={event =>
                setForm(next => ({
                  ...next,
                  buyMarginType: event.target.value as CurrencyRateMarginType | '',
                }))
              }
              className={inputClass}
            >
              <option value="">Select</option>
              <option value="PERCENT">PERCENT</option>
              <option value="RATE">RATE</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Buy Margin Value</label>
            <input
              value={form.buyMarginValue}
              onChange={event => setForm(next => ({ ...next, buyMarginValue: event.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Sale Margin Type</label>
            <select
              value={form.saleMarginType}
              onChange={event =>
                setForm(next => ({
                  ...next,
                  saleMarginType: event.target.value as CurrencyRateMarginType | '',
                }))
              }
              className={inputClass}
            >
              <option value="">Select</option>
              <option value="PERCENT">PERCENT</option>
              <option value="RATE">RATE</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Sale Margin Value</label>
            <input
              value={form.saleMarginValue}
              onChange={event => setForm(next => ({ ...next, saleMarginValue: event.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={event => setForm(next => ({ ...next, isActive: event.target.checked }))}
          />
          Active
        </label>

        <div className="flex gap-3">
          <Button type="button" onClick={() => void onSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Group' : 'Create Group'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>

        <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-xs text-text-secondary">
          Buy preview: {form.buyMarginType || 'EMPTY'} {formatMarginValue(form.buyMarginType, form.buyMarginValue)}
          <br />
          Sale preview: {form.saleMarginType || 'EMPTY'} {formatMarginValue(form.saleMarginType, form.saleMarginValue)}
        </div>
      </div>
    </Modal>
  );
};

