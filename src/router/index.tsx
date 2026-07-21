import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedLayout, PublicLayout } from '../components/layouts';
import { Loader } from '@/components/ui/loader';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/login/LoginPage'));
const ChooseWorkplacePage = lazy(
  () => import('../pages/auth/choose-workplace/ChooseWorkplacePage')
);
const ForgotPasswordPage = lazy(
  () => import('../pages/auth/forgot-password/ForgotPasswordPage')
);
const ResetPasswordPage = lazy(
  () => import('../pages/auth/reset-password/ResetPasswordPage')
);
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));

const UserCreatePage = lazy(
  () => import('../pages/users/create/UserCreatePage')
);
const UserListPage = lazy(() => import('../pages/users/list/UserListPage'));
const UserEditPage = lazy(
  () => import('../pages/users/edit/[id]/UserEditPage')
);
const UserDetailPage = lazy(
  () => import('../pages/users/detail/[id]/UserDetailPage')
);
const CompanyProfilePage = lazy(
  () =>
    import('../pages/master/system-setups/company-profile/list/CompanyProfileListPage')
);
const CompanyProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/company-profile/create/CompanyProfileCreatePage')
);
const CompanyProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/company-profile/edit/[id]/CompanyProfileEditPage')
);
const CountryProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/country-profile/list/CountryProfileListPage')
);
const CountryProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/country-profile/create/CountryProfileCreatePage')
);
const CountryProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/country-profile/edit/[id]/CountryProfileEditPage')
);
const StateProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/state-profile/list/StateProfileListPage')
);
const StateProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/state-profile/create/StateProfileCreatePage')
);
const StateProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/state-profile/edit/[id]/StateProfileEditPage')
);
const BranchProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/branch-profile/list/BranchProfileListPage')
);
const BranchProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/branch-profile/create/BranchProfileCreatePage')
);
const BranchProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/branch-profile/edit/[id]/BranchProfileEditPage')
);
const ProductProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/product-profile/list/ProductProfileListPage')
);
const ProductProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/product-profile/create/ProductProfileCreatePage')
);
const ProductProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/product-profile/edit/[id]/ProductProfileEditPage')
);
const CounterProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/counter-profile/list/CounterProfileListPage')
);
const CounterProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/counter-profile/create/CounterProfileCreatePage')
);
const CounterProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/counter-profile/edit/[id]/CounterProfileEditPage')
);
const DocumentProfileListPage = lazy(
  () => import('../pages/admin/document-profiles/list/DocumentProfileListPage')
);
const DocumentProfileCreatePage = lazy(
  () =>
    import('../pages/admin/document-profiles/create/DocumentProfileCreatePage')
);
const DocumentProfileEditPage = lazy(
  () =>
    import('../pages/admin/document-profiles/edit/[id]/DocumentProfileEditPage')
);
const MiscellaneousProfileListPage = lazy(
  () => import('../pages/admin/miscellaneous-profile/list')
);
const MiscellaneousProfileCreatePage = lazy(
  () => import('../pages/admin/miscellaneous-profile/create')
);
const MiscellaneousProfileEditPage = lazy(
  () => import('../pages/admin/miscellaneous-profile/edit/[id]')
);
const MenuPage = lazy(() => import('../pages/admin/menu/MenuPage'));
const ManualBillBookPage = lazy(
  () => import('../pages/manual-bill-books/ManualBillBookPage')
);
const ManualBillBookCreatePage = lazy(
  () => import('../pages/manual-bill-books/ManualBillBookCreatePage')
);
const ManualBillBookAcknowledgementPage = lazy(
  () => import('../pages/manual-bill-books/ManualBillBookAcknowledgementPage')
);
const ManagerToCashierAllocationPage = lazy(
  () => import('../pages/manual-bill-books/ManagerToCashierAllocationPage')
);
const ManualBillDPMappingPage = lazy(
  () => import('../pages/manual-bill-books/ManualBillDPMappingPage')
);
const DeliveryPersonManagementPage = lazy(
  () => import('../pages/manual-bill-books/DeliveryPersonManagementPage')
);
const ChequeBookPage = lazy(
  () => import('../pages/chequebooks/ChequeBookPage')
);
const ChequeBookCreatePage = lazy(
  () => import('../pages/chequebooks/create/ChequeBookCreatePage')
);
const ChequeBookAcknowledgementPage = lazy(
  () => import('../pages/chequebooks/ChequeBookAcknowledgementPage')
);
const ChequeBookAllocationPage = lazy(
  () => import('../pages/chequebooks/ChequeBookAllocationPage')
);
const ChequeBookReturnPage = lazy(
  () => import('../pages/chequebooks/ChequeBookReturnPage')
);
const AdditionalSettingsPage = lazy(
  () => import('../pages/admin/additional-settings')
);
const TransactionAccountPostingsPage = lazy(
  () => import('../pages/admin/transaction-account-postings/TransactionAccountPostingsPage')
);
const MigrationsPage = lazy(() => import('../pages/admin/migrations'));
const CurrencyRatesPage = lazy(() => import('../pages/admin/currency-rates'));
const MailConsolePage = lazy(
  () => import('../pages/auth/mail-console/MailConsolePage')
);
const FinancialCodesListPage = lazy(
  () => import('../pages/admin/financial-codes/list')
);
const FinancialCodesCreatePage = lazy(
  () => import('../pages/admin/financial-codes/create')
);
const FinancialCodesEditPage = lazy(
  () => import('../pages/admin/financial-codes/edit/[id]')
);
const AccountsProfileListPage = lazy(
  () => import('../pages/admin/accounts-profile/list')
);
const AccountsProfileCreatePage = lazy(
  () => import('../pages/admin/accounts-profile/create')
);
const AccountsProfileEditPage = lazy(
  () => import('../pages/admin/accounts-profile/edit/[id]')
);
const PartyProfileListPage = lazy(() => import('../pages/party-profiles/list'));
const PartyProfileCreatePage = lazy(
  () => import('../pages/party-profiles/create')
);
const PartyProfileEditPage = lazy(
  () => import('../pages/party-profiles/edit/[id]')
);
const PartyProfileDocumentsPage = lazy(
  () => import('../pages/party-profiles/documents/[id]')
);
const PurchasePage = lazy(() => import('../pages/purchase/[slug]'));
const PurchaseCreatePage = lazy(
  () => import('../pages/purchase/[slug]/create')
);
const PurchaseEditPage = lazy(
  () => import('../pages/purchase/[slug]/edit/[id]')
);
const OtherTransactionListPage = lazy(() => import('../modules/purchase/views/OtherTransactionListView').then(m => ({ default: m.OtherTransactionListView })));
const OtherTransactionCreatePage = lazy(() => import('../modules/purchase/views/OtherTransactionCreateView').then(m => ({ default: m.OtherTransactionCreateView })));
const OtherTransactionEditPage = lazy(() => import('../modules/purchase/views/OtherTransactionEditView').then(m => ({ default: m.OtherTransactionEditView })));

const MasterPagesPage = lazy(
  () => import('../pages/master/system-setups/master-pages/MasterPagesPage')
);
const UserProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/user-profile/list/UserProfileListPage')
);
const UserProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/user-profile/create/UserProfileCreatePage')
);
const UserProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/user-profile/edit/[id]/UserProfileEditPage')
);
const UserRoleListPage = lazy(
  () => import('../pages/master/system-setups/user-role/list/UserRoleListPage')
);
const UserRoleCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/user-role/create/UserRoleCreatePage')
);
const UserRoleEditPage = lazy(
  () =>
    import('../pages/master/system-setups/user-role/edit/[id]/UserRoleEditPage')
);
const MasterPageResolverPage = lazy(
  () =>
    import('../pages/master/system-setups/master-pages/resolve/MasterPageResolverPage')
);

const CurrencyProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/currency-profile/list/CurrencyProfileListPage')
);
const CurrencyProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/currency-profile/create/CurrencyProfileCreatePage')
);
const CurrencyProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/currency-profile/edit/[id]/CurrencyProfileEditPage')
);
const TdsProfileListPage = lazy(
  () =>
    import('../pages/master/system-setups/tds-profile/list/TdsProfileListPage')
);
const TdsProfileCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/tds-profile/create/TdsProfileCreatePage')
);
const TdsProfileEditPage = lazy(
  () =>
    import('../pages/master/system-setups/tds-profile/edit/[id]/TdsProfileEditPage')
);

const ExpenseBookingListPage = lazy(
  () =>
    import('../pages/master/system-setups/expense-booking/ExpenseBookingListPage')
);
const ExpenseBookingCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/expense-booking/ExpenseBookingCreatePage')
);
const ExpenseBookingEditPage = lazy(
  () =>
    import('../pages/master/system-setups/expense-booking/ExpenseBookingEditPage')
);

const IncomeBookingListPage = lazy(
  () =>
    import('../pages/master/system-setups/income-booking/IncomeBookingListPage')
);
const IncomeBookingCreatePage = lazy(
  () =>
    import('../pages/master/system-setups/income-booking/IncomeBookingCreatePage')
);
const IncomeBookingEditPage = lazy(
  () =>
    import('../pages/master/system-setups/income-booking/IncomeBookingEditPage')
);
const ReportsPage = lazy(() => import('../pages/reports'));

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicLayout>
        <LoginPage />
      </PublicLayout>
    ),
  },
  {
    path: '/choose-workplace',
    element: <ChooseWorkplacePage />,
  },
  {
    path: '/forgot-password',
    element: (
      <PublicLayout>
        <ForgotPasswordPage />
      </PublicLayout>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PublicLayout>
        <ResetPasswordPage />
      </PublicLayout>
    ),
  },
  {
    path: '/mail-console',
    element: (
      <PublicLayout>
        <MailConsolePage />
      </PublicLayout>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedLayout>
        <DashboardPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/users/create',
    element: (
      <ProtectedLayout>
        <UserCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/users/list',
    element: (
      <ProtectedLayout>
        <UserListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/users/edit/:id',
    element: (
      <ProtectedLayout>
        <UserEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/users/:id',
    element: (
      <ProtectedLayout>
        <UserDetailPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/company-profile',
    element: (
      <ProtectedLayout>
        <CompanyProfilePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/company-profile/create',
    element: (
      <ProtectedLayout>
        <CompanyProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/company-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <CompanyProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/branch-profile',
    element: (
      <ProtectedLayout>
        <BranchProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/branch-profile/create',
    element: (
      <ProtectedLayout>
        <BranchProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/branch-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <BranchProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/review/branch-profile',
    element: (
      <ProtectedLayout>
        <BranchProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/counter-profile',
    element: (
      <ProtectedLayout>
        <CounterProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/counter-profile/create',
    element: (
      <ProtectedLayout>
        <CounterProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/counter-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <CounterProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/document-profile',
    element: (
      <ProtectedLayout>
        <DocumentProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/document-profile/create',
    element: (
      <ProtectedLayout>
        <DocumentProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/document-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <DocumentProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/miscellaneous-profile',
    element: (
      <ProtectedLayout>
        <MiscellaneousProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/miscellaneous-profile/create',
    element: (
      <ProtectedLayout>
        <MiscellaneousProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/miscellaneous-profile/edit/:code',
    element: (
      <ProtectedLayout>
        <MiscellaneousProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/menu-management',
    element: (
      <ProtectedLayout>
        <MenuPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedLayout>
        <ReportsPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/reports/:slug',
    element: (
      <ProtectedLayout>
        <ReportsPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/manual-bill-books',
    element: (
      <ProtectedLayout>
        <ManualBillBookPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/manual-bill-books/create',
    element: (
      <ProtectedLayout>
        <ManualBillBookCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/manual-bill-books',
    element: (
      <ProtectedLayout>
        <ManualBillBookPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/manual-bill-books/create',
    element: (
      <ProtectedLayout>
        <ManualBillBookCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/manual-bill-books/acknowledgement',
    element: (
      <ProtectedLayout>
        <ManualBillBookAcknowledgementPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/manual-bill-books/allocation',
    element: (
      <ProtectedLayout>
        <ManagerToCashierAllocationPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/manual-bill-books/dp-mapping',
    element: (
      <ProtectedLayout>
        <ManualBillDPMappingPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/manual-bill-books/dp-unmapping',
    element: (
      <ProtectedLayout>
        <ManualBillDPMappingPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/manual-bill-books/delivery-persons',
    element: (
      <ProtectedLayout>
        <DeliveryPersonManagementPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/cheque-books/create',
    element: (
      <ProtectedLayout>
        <ChequeBookCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/cheque-books',
    element: (
      <ProtectedLayout>
        <ChequeBookPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/cheque-books/acknowledgement',
    element: (
      <ProtectedLayout>
        <ChequeBookAcknowledgementPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/cheque-books/allocation',
    element: (
      <ProtectedLayout>
        <ChequeBookAllocationPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/cheque-books/return',
    element: (
      <ProtectedLayout>
        <ChequeBookReturnPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/additional-settings',
    element: (
      <ProtectedLayout>
        <AdditionalSettingsPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/transaction-account-postings',
    element: (
      <ProtectedLayout>
        <TransactionAccountPostingsPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/migrations',
    element: (
      <ProtectedLayout>
        <MigrationsPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/currency-rates',
    element: (
      <ProtectedLayout>
        <CurrencyRatesPage />
      </ProtectedLayout>
    ),
  },

  {
    path: '/financial-profile',
    element: (
      <ProtectedLayout>
        <FinancialCodesListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/financial-profile/create',
    element: (
      <ProtectedLayout>
        <FinancialCodesCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/financial-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <FinancialCodesEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/accounts-profile',
    element: (
      <ProtectedLayout>
        <AccountsProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/accounts-profile/create',
    element: (
      <ProtectedLayout>
        <AccountsProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/accounts-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <AccountsProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/party-profiles',
    element: (
      <ProtectedLayout>
        <PartyProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/party-profiles/:type',
    element: (
      <ProtectedLayout>
        <PartyProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/party-profiles/:type/create',
    element: (
      <ProtectedLayout>
        <PartyProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/party-profiles/:type/edit/:id',
    element: (
      <ProtectedLayout>
        <PartyProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/party-profiles/:type/documents/:id',
    element: (
      <ProtectedLayout>
        <PartyProfileDocumentsPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/other-transactions',
    element: (
      <ProtectedLayout>
        <OtherTransactionListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/other-transactions/create',
    element: (
      <ProtectedLayout>
        <OtherTransactionCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/other-transactions/edit/:id',
    element: (
      <ProtectedLayout>
        <OtherTransactionEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/purchase/:slug',
    element: (
      <ProtectedLayout>
        <PurchasePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/sale/:slug',
    element: (
      <ProtectedLayout>
        <PurchasePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/purchase/:slug/create',
    element: (
      <ProtectedLayout>
        <PurchaseCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/sale/:slug/create',
    element: (
      <ProtectedLayout>
        <PurchaseCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/purchase/:slug/edit/:id',
    element: (
      <ProtectedLayout>
        <PurchaseEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/sale/:slug/edit/:id',
    element: (
      <ProtectedLayout>
        <PurchaseEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/country-profile',
    element: (
      <ProtectedLayout>
        <CountryProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/country-profile/create',
    element: (
      <ProtectedLayout>
        <CountryProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/country-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <CountryProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/state-profile',
    element: (
      <ProtectedLayout>
        <StateProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/state-profile/create',
    element: (
      <ProtectedLayout>
        <StateProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/state-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <StateProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/expense-booking',
    element: (
      <ProtectedLayout>
        <ExpenseBookingListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/expense-booking/create',
    element: (
      <ProtectedLayout>
        <ExpenseBookingCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/expense-booking/edit/:id',
    element: (
      <ProtectedLayout>
        <ExpenseBookingEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/income-booking',
    element: (
      <ProtectedLayout>
        <IncomeBookingListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/income-booking/create',
    element: (
      <ProtectedLayout>
        <IncomeBookingCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/income-booking/edit/:id',
    element: (
      <ProtectedLayout>
        <IncomeBookingEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/product-profile',
    element: (
      <ProtectedLayout>
        <ProductProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/product-profile/create',
    element: (
      <ProtectedLayout>
        <ProductProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/product-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <ProductProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/currency-profile',
    element: (
      <ProtectedLayout>
        <CurrencyProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/currency-profile/create',
    element: (
      <ProtectedLayout>
        <CurrencyProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/currency-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <CurrencyProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/tds-profile',
    element: (
      <ProtectedLayout>
        <TdsProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/tds-profile/create',
    element: (
      <ProtectedLayout>
        <TdsProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/tds-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <TdsProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/master-pages',
    element: (
      <ProtectedLayout>
        <MasterPagesPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/user-profile',
    element: (
      <ProtectedLayout>
        <UserProfileListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/user-profile/create',
    element: (
      <ProtectedLayout>
        <UserProfileCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/user-profile/edit/:id',
    element: (
      <ProtectedLayout>
        <UserProfileEditPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/user-role',
    element: (
      <ProtectedLayout>
        <UserRoleListPage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/user-role/create',
    element: (
      <ProtectedLayout>
        <UserRoleCreatePage />
      </ProtectedLayout>
    ),
  },
  {
    path: '/admin/user-role/edit/:id',
    element: (
      <ProtectedLayout>
        <UserRoleEditPage />
      </ProtectedLayout>
    ),
  },

  {
    path: '*',
    element: (
      <ProtectedLayout>
        <MasterPageResolverPage />
      </ProtectedLayout>
    ),
  },
]);

export const AppRouter = () => {
  return (
    <Suspense
      fallback={
        <div className="text-center py-4">
          <Loader />
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
};
