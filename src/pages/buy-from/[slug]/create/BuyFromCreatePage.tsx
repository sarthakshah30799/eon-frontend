import { useParams } from 'react-router-dom';
import { NotFoundState } from '@/components/ui/not-found-state';
import { BuyFromCreateView } from '@/modules/buyFrom';
import { getBuyFromPageTypeFromSlug } from '../buyFromPage.enum';

const BuyFromCreatePage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const buyFromPageType = getBuyFromPageTypeFromSlug(slug);

  if (!buyFromPageType) {
    return (
      <NotFoundState message="You do not have access to this buy-from page." />
    );
  }

  return <BuyFromCreateView buyFromPageType={buyFromPageType} />;
};

export default BuyFromCreatePage;
