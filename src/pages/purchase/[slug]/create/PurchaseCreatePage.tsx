import { useLocation, useParams } from 'react-router-dom';
import { NotFoundState } from '@/components/ui/not-found-state';
import { PurchaseCreateView } from '@/modules/purchase';
import { getPurchasePageTypeFromPath } from '../purchasePage.enum';

const PurchaseCreatePage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const purchasePageType = getPurchasePageTypeFromPath(location.pathname, slug);

  if (!purchasePageType) {
    return (
      <NotFoundState message="You do not have access to this purchase page." />
    );
  }

  return <PurchaseCreateView purchasePageType={purchasePageType} />;
};

export default PurchaseCreatePage;
