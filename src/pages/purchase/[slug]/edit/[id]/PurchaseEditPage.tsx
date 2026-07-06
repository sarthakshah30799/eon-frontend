import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NotFoundState } from '@/components/ui/not-found-state';
import { getPurchasePageTypeFromSlug } from '../../purchasePage.enum';

const PurchaseEditPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const purchasePageType = getPurchasePageTypeFromSlug(slug);

  useEffect(() => {
    if (purchasePageType && slug) {
      navigate(`/purchase/${slug}`, { replace: true });
    }
  }, [navigate, purchasePageType, slug]);

  if (!purchasePageType) {
    return (
      <NotFoundState message="You do not have access to this transaction page." />
    );
  }

  return null;
};

export default PurchaseEditPage;
