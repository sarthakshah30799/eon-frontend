import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import {
  CATEGORY_OPTION_CODE_OPTIONS,
  CATEGORY_OPTIONS_TEXTS,
} from '../constants';
import {
  buildCategoryOptionPayloads,
  createEmptyCategoryOptionsFormValues,
} from '../utils';
import {
  useBulkCreateMiscellaneousProfiles,
  useExistingMiscellaneousProfileCodes,
} from '../hooks';
import { MiscellaneousProfileForm } from '../forms';
import type { ICategoryOptionsFormValues } from '../utils';

export const MiscellaneousProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitCategoryOptions, isPending } =
    useBulkCreateMiscellaneousProfiles();
  const { data: existingCodes = [] } = useExistingMiscellaneousProfileCodes();

  const availableCodeOptions = useMemo(() => {
    const existingCodeSet = new Set(
      existingCodes.map(code => code.trim().toUpperCase())
    );

    return CATEGORY_OPTION_CODE_OPTIONS.filter(
      option => !existingCodeSet.has(option.value)
    );
  }, [existingCodes]);

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
