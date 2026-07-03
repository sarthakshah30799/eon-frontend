import { useParams } from 'react-router-dom';
import { NotFoundState } from '@/components/ui/not-found-state';
import { BuyFromDocumentsView } from '@/modules/buyFrom/views/BuyFromDocumentsView';
import { getBuyFromPageTypeFromSlug } from '../buyFromPage.enum';

const BuyFromDocumentsPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const buyFromPageType = getBuyFromPageTypeFromSlug(slug);

  if (!buyFromPageType) {
    return (
      <NotFoundState message="You do not have access to this buy-from documents page." />
    );
  }

  return <BuyFromDocumentsView buyFromPageType={buyFromPageType} />;
};

export default BuyFromDocumentsPage;
