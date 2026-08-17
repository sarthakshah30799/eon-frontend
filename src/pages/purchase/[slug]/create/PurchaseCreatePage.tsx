import { useLocation, useParams } from 'react-router-dom';
import { NotFoundState } from '@/components/ui/not-found-state';
import { PurchaseCreateView, AD1CreateView } from '@/modules/purchase';
import { PURCHASE_PAGE_STATUS_TEXT } from '@/modules/purchase/constants/purchaseConstants';
import { getPurchasePageTypeFromPath } from '../purchasePage.enum';

const PurchaseCreatePage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const purchasePageType = getPurchasePageTypeFromPath(location.pathname, slug);

  if (slug === 'ad1') {
    return <AD1CreateView />;
  }

  if (!purchasePageType) {
    return (
      <NotFoundState message={PURCHASE_PAGE_STATUS_TEXT.pageNotFound} />
    );
  }

  return <PurchaseCreateView purchasePageType={purchasePageType} />;
};

export default PurchaseCreatePage;
