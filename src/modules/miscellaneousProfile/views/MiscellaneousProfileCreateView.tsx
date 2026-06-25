import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { CATEGORY_OPTIONS_TEXTS } from '../constants';
import { CATEGORY_OPTION_CODE_OPTIONS } from '../constants';
import {
  buildCategoryOptionPayloads,
  createEmptyCategoryOptionsFormValues,
} from '../utils';
import { useBulkCreateMiscellaneousProfiles } from '../hooks';
import { useListMiscellaneousProfiles } from '../hooks';
import { MiscellaneousProfileForm } from '../forms';
import type { ICategoryOptionsFormValues } from '../utils';

export const MiscellaneousProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitCategoryOptions, isPending } = useBulkCreateMiscellaneousProfiles();
  const { data: existingOptions = [] } = useListMiscellaneousProfiles();

  const availableCodeOptions = useMemo(() => {
    const existingCodes = new Set(
      existingOptions.map(option => option.code.trim().toUpperCase())
    );

    return CATEGORY_OPTION_CODE_OPTIONS.filter(option => !existingCodes.has(option.value));
  }, [existingOptions]);

  const handleSubmit = async (values: ICategoryOptionsFormValues) => {
    await submitCategoryOptions(buildCategoryOptionPayloads(values));
    navigate('/admin/miscellaneous-profile');
  };

  return (
    <div className="space-y-4">
      <section className="mx-auto w-full max-w-6xl rounded-md border border-border-primary bg-surface-primary p-5 shadow-sm">
        <MiscellaneousProfileForm
          defaultValues={createEmptyCategoryOptionsFormValues()}
          onSubmit={handleSubmit}
          submitLabel={CATEGORY_OPTIONS_TEXTS.SAVE_OPTIONS}
          isSubmitting={isPending}
          mode="create"
          codeOptions={availableCodeOptions}
        />
      </section>
    </div>
  );
};

export default MiscellaneousProfileCreateView;
