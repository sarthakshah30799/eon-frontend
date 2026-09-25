import { ProductSettlementDocumentKind } from '@/api/productSettlement';
import * as yup from 'yup';
import { PRODUCT_SETTLEMENT_TEXT } from '../constants/productSettlementConstants';

export const productSettlementSchema = yup.object({
  kind: yup.string().required(),
  issuerPartyProfileId: yup.string().required('Issuer is required'),
  currencyId: yup.string().required('Currency is required'),
  hoBranchId: yup.string().when('kind', {
    is: ProductSettlementDocumentKind.HO_ISSUER,
    then: schema => schema.required(PRODUCT_SETTLEMENT_TEXT.hoBranchRequired),
    otherwise: schema => schema.optional(),
  }),
  transactionDate: yup.string().required('Transaction date is required'),
  reference: yup.string().max(150).optional(),
  remarks: yup.string().max(500).optional(),
  items: yup
    .array()
    .of(
      yup.object({
        id: yup.string().required(),
        rate: yup
          .string()
          .required('Rate is required')
          .test(
            'positive',
            'Rate must be greater than zero',
            value => Number(value) > 0
          ),
        amount: yup.string().required(),
      })
    )
    .min(1, 'Select at least one item')
    .required(),
});
