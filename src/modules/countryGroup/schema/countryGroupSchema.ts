import * as yup from 'yup';

const isBlank = (value?: string | null) => !value || !value.trim();

const decimalString = (label: string) =>
  yup
    .string()
    .transform(value =>
      value === null || value === undefined ? '' : String(value)
    )
    .test({
      name: `${label}-decimal`,
      message: `${label} must be a valid decimal number`,
      test: value =>
        isBlank(value) || /^\d+(\.\d{1,2})?$/.test(String(value).trim()),
    })
    .default('');

const integerString = (label: string) =>
  yup
    .string()
    .transform(value =>
      value === null || value === undefined ? '' : String(value)
    )
    .test({
      name: `${label}-integer`,
      message: `${label} must be a valid integer`,
      test: value => isBlank(value) || /^\d+$/.test(String(value).trim()),
    })
    .default('');

export const countryGroupSchema = yup
  .object({
    name: yup.string().trim().required('Name is required'),
    code: yup
      .string()
      .trim()
      .length(2, 'Code must be exactly 2 characters')
      .required('Code is required'),
    sellLimitAmount: decimalString('Sell Limit Amount'),
    sellLimitCurrencyId: yup.string().trim().default(''),
    minTravelDays: integerString('Minimum Travel Days'),
    maxTravelDays: integerString('Maximum Travel Days'),
  })
  .test(
    'sell-limit-pair',
    'Sell limit amount and currency must be provided together',
    value => {
      const hasAmount = !isBlank(value?.sellLimitAmount);
      const hasCurrency = !isBlank(value?.sellLimitCurrencyId);
      return hasAmount === hasCurrency;
    }
  )
  .test(
    'travel-days-order',
    'Minimum travel days cannot be greater than maximum travel days',
    value => {
      const minDays = isBlank(value?.minTravelDays)
        ? null
        : Number(value?.minTravelDays);
      const maxDays = isBlank(value?.maxTravelDays)
        ? null
        : Number(value?.maxTravelDays);

      if (minDays === null || maxDays === null) {
        return true;
      }

      return minDays <= maxDays;
    }
  );
