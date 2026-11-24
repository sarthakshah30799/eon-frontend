import { useQuery } from '@tanstack/react-query';
import {
  productSettlementApi,
  type TpAvailabilityParams,
  type TpAvailabilityResponse,
} from '@/api/productSettlement';

export interface UseTpSettlementAvailabilityOptions extends TpAvailabilityParams {
  enabled?: boolean;
}

export const useTpSettlementAvailability = ({
  currencyId,
  issuerPartyProfileId,
  hoBranchId,
  enabled = true,
}: UseTpSettlementAvailabilityOptions) => {
  return useQuery<TpAvailabilityResponse>({
    queryKey: [
      'product-settlement',
      'tp-availability',
      currencyId,
      issuerPartyProfileId ?? '',
      hoBranchId ?? '',
    ],
    queryFn: () =>
      productSettlementApi.getTpAvailability({
        currencyId,
        issuerPartyProfileId,
        hoBranchId,
      }),
    enabled: Boolean(enabled && currencyId),
  });
};

export default useTpSettlementAvailability;
