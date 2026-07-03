import { useParams } from 'react-router-dom';
import { NotFoundState } from '@/components/ui/not-found-state';
import {
  BuyFromPageType,
  getBuyFromPageTitle,
  getBuyFromPageTypeFromSlug,
} from './buyFromPage.enum';

interface BuyFromPageViewProps {
  buyFromPageType: BuyFromPageType | null;
}

const BuyFromPageView = ({ buyFromPageType }: BuyFromPageViewProps) => {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <h1 className="text-2xl font-semibold text-text-primary">
        {getBuyFromPageTitle(buyFromPageType)}
      </h1>
    </section>
  );
};

const BuyFromPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const buyFromPageType = getBuyFromPageTypeFromSlug(slug);

  if (!buyFromPageType) {
    return (
      <NotFoundState message="You do not have access to this buy-from page." />
    );
  }

  return <BuyFromPageView buyFromPageType={buyFromPageType} />;
};

export default BuyFromPage;
