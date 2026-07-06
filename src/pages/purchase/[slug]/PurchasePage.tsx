import { useParams } from 'react-router-dom';
import { NotFoundState } from '@/components/ui/not-found-state';
import {
  getPurchasePageTitle,
  getPurchasePageTypeFromSlug,
  type PurchasePageType,
} from './purchasePage.enum';

interface PurchasePageViewProps {
  purchasePageType: PurchasePageType | null;
}

const PurchasePageView = ({ purchasePageType }: PurchasePageViewProps) => {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <h1 className="text-2xl font-semibold text-text-primary">
        {getPurchasePageTitle(purchasePageType)}
      </h1>
    </section>
  );
};

const PurchasePage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const purchasePageType = getPurchasePageTypeFromSlug(slug);

  if (!purchasePageType) {
    return (
      <NotFoundState message="You do not have access to this purchase page." />
    );
  }

  return <PurchasePageView purchasePageType={purchasePageType} />;
};

export default PurchasePage;
