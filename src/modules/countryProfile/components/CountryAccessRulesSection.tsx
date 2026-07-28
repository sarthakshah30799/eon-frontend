import { BranchUserAccessRulesManager } from '@/modules/transactionPolicies';
import {
  useCreateCountryAccessRules,
  useListCountryAccessRules,
  useRevokeCountryAccessRule,
} from '@/modules/transactionPolicies';

interface CountryAccessRulesSectionProps {
  countryId: string;
  countryBlocked: boolean;
}

export const CountryAccessRulesSection = ({
  countryId,
  countryBlocked,
}: CountryAccessRulesSectionProps) => {
  const { data: rules = [], isLoading } = useListCountryAccessRules(countryId);
  const { submitCountryAccessRules, isPending: isCreating } =
    useCreateCountryAccessRules(countryId);
  const { revokeCountryAccessRule, isPending: isRevoking } =
    useRevokeCountryAccessRule(countryId);

  if (!countryId) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-sm border border-border-primary bg-surface-secondary p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-tertiary">
          Branch / User Access
        </h3>
        <p className="text-sm text-text-secondary">
          {countryBlocked
            ? 'Allow specific branches and users to use this blocked country.'
            : 'This section is available for configuring exceptions, even before blocking is turned on.'}
        </p>
      </div>

      <BranchUserAccessRulesManager
        title="Country Access Rules"
        description="Create specific branch and user exceptions for this country."
        rules={rules}
        loading={isLoading}
        isSubmitting={isCreating || isRevoking}
        onCreateRules={submitCountryAccessRules}
        onRevokeRule={revokeCountryAccessRule}
        emptyMessage="No access rules created for this country."
      />
    </div>
  );
};
