import { useParams } from 'react-router-dom';
import { NotFoundState } from '@/components/ui/not-found-state';
import { PurchaseDocumentsView } from '@/modules/purchase';
import { getPurchasePageTypeFromSlug } from '../purchasePage.enum';

const PurchaseDocumentsPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const purchasePageType = getPurchasePageTypeFromSlug(slug);

  if (!purchasePageType) {
    return (
      <NotFoundState message="You do not have access to this purchase documents page." />
    );
  }

  return <PurchaseDocumentsView purchasePageType={purchasePageType} />;
};

export default PurchaseDocumentsPage;
