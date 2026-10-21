import { useMemo } from 'react';
import { useCategoryOptions } from '@/hooks';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import {
  PartyProfileTypeEnum,
  type PartyProfileType,
} from '../types/partyProfileTypes';
import type { AsyncSelectOption } from '@/components/ui';

export interface PartyProfileFilterByEntityType {
  targetPartyTypes: PartyProfileType[];
  isIndividualFilter?: boolean;
  entityTypeIdFilter?: string;
  isIndividualSelection: boolean;
  selectedOption?: AsyncSelectOption;
}

export const resolvePartyProfileFilterByEntityType = (
  entityTypeOption?: AsyncSelectOption | null
): PartyProfileFilterByEntityType => {
  if (!entityTypeOption) {
    return {
      targetPartyTypes: Object.values(PartyProfileTypeEnum),
      isIndividualFilter: undefined,
      entityTypeIdFilter: undefined,
      isIndividualSelection: false,
    };
  }

  const token = String(entityTypeOption.label || entityTypeOption.value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  if (token === 'INDIVIDUAL') {
    return {
      targetPartyTypes: [PartyProfileTypeEnum.CORPORATE_CLIENT],
      isIndividualFilter: true,
      entityTypeIdFilter: undefined,
      isIndividualSelection: true,
      selectedOption: entityTypeOption,
    };
  }

  if (
    token === 'COMPANY' ||
    token === 'CORPORATE' ||
    token === 'CORPORATE_CLIENT'
  ) {
    return {
      targetPartyTypes: [PartyProfileTypeEnum.CORPORATE_CLIENT],
      isIndividualFilter: false,
      entityTypeIdFilter: undefined,
      isIndividualSelection: false,
      selectedOption: entityTypeOption,
    };
  }

  if (token === 'FFMC' || token === 'AUTHORISED_DEALER') {
    return {
      targetPartyTypes: [
        PartyProfileTypeEnum.FFMC,
        PartyProfileTypeEnum.AUTHORISED_DEALER,
      ],
      isIndividualFilter: undefined,
      entityTypeIdFilter: undefined,
      isIndividualSelection: false,
      selectedOption: entityTypeOption,
    };
  }

  if (token === 'RMC') {
    return {
      targetPartyTypes: [PartyProfileTypeEnum.RMC],
      isIndividualFilter: undefined,
      entityTypeIdFilter: undefined,
      isIndividualSelection: false,
      selectedOption: entityTypeOption,
    };
  }

  if (token === 'AGENT') {
    return {
      targetPartyTypes: [PartyProfileTypeEnum.AGENT],
      isIndividualFilter: undefined,
      entityTypeIdFilter: undefined,
      isIndividualSelection: false,
      selectedOption: entityTypeOption,
    };
  }

  if (token === 'FRANCHISE') {
    return {
      targetPartyTypes: [PartyProfileTypeEnum.FRANCHISE],
      isIndividualFilter: undefined,
      entityTypeIdFilter: undefined,
      isIndividualSelection: false,
      selectedOption: entityTypeOption,
    };
  }

  if (token === 'FOREX' || token === 'FOREX_CORRESPONDENT') {
    return {
      targetPartyTypes: [PartyProfileTypeEnum.FOREX_CORRESPONDENT],
      isIndividualFilter: undefined,
      entityTypeIdFilter: undefined,
      isIndividualSelection: false,
      selectedOption: entityTypeOption,
    };
  }

  if (token === 'FOREIGN' || token === 'FOREIGN_CORRESPONDENT') {
    return {
      targetPartyTypes: [PartyProfileTypeEnum.FOREIGN_CORRESPONDENT],
      isIndividualFilter: undefined,
      entityTypeIdFilter: undefined,
      isIndividualSelection: false,
      selectedOption: entityTypeOption,
    };
  }

  if (token === 'MISC' || token === 'MISC_PROFILE') {
    return {
      targetPartyTypes: [PartyProfileTypeEnum.MISC_PROFILE],
      isIndividualFilter: undefined,
      entityTypeIdFilter: undefined,
      isIndividualSelection: false,
      selectedOption: entityTypeOption,
    };
  }

  const directMatch = Object.values(PartyProfileTypeEnum).find(
    t => t.toUpperCase() === token
  );
  if (directMatch) {
    return {
      targetPartyTypes: [directMatch],
      isIndividualFilter: undefined,
      entityTypeIdFilter: undefined,
      isIndividualSelection: false,
      selectedOption: entityTypeOption,
    };
  }

  return {
    targetPartyTypes: [PartyProfileTypeEnum.CORPORATE_CLIENT],
    isIndividualFilter: false,
    entityTypeIdFilter: String(entityTypeOption.value),
    isIndividualSelection: false,
    selectedOption: entityTypeOption,
  };
};

export const usePartyProfileFilterByEntityType = (
  entityTypeOptionId?: string | null
): PartyProfileFilterByEntityType => {
  const { defaultOptions: entityTypeOptions } = useCategoryOptions(
    CategoryOptionCodeEnum.EntityType
  );

  const selectedEntityTypeOption = useMemo(
    () =>
      entityTypeOptions.find(
        opt => String(opt.value) === String(entityTypeOptionId)
      ),
    [entityTypeOptions, entityTypeOptionId]
  );

  return useMemo(
    () => resolvePartyProfileFilterByEntityType(selectedEntityTypeOption),
    [selectedEntityTypeOption]
  );
};
