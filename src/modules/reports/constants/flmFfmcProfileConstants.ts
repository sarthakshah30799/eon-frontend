export const FlmFfmcProfileTypeEnum = {
  FFMC: 'FFMC',
  RMC: 'RMC',
  FOREX: 'FOREX',
  FOREIGN: 'FOREIGN',
  MISC: 'MISC',
  FRANCHISE: 'FRANCHISE',
} as const;

export type FlmFfmcProfileType =
  (typeof FlmFfmcProfileTypeEnum)[keyof typeof FlmFfmcProfileTypeEnum];

export const FLM_FFMC_PROFILE_OPTIONS: Array<{
  id: FlmFfmcProfileType;
  label: string;
}> = [
  { id: FlmFfmcProfileTypeEnum.FFMC, label: 'FFMC' },
  { id: FlmFfmcProfileTypeEnum.RMC, label: 'RMC' },
  { id: FlmFfmcProfileTypeEnum.FOREX, label: 'FOREX' },
  { id: FlmFfmcProfileTypeEnum.FOREIGN, label: 'FOREIGN' },
  { id: FlmFfmcProfileTypeEnum.MISC, label: 'MISC' },
  { id: FlmFfmcProfileTypeEnum.FRANCHISE, label: 'FRANCHISE' },
];

export const FLM_FFMC_PROFILE_IDS = FLM_FFMC_PROFILE_OPTIONS.map(
  option => option.id,
);
