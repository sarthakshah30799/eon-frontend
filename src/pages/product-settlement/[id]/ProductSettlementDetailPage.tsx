import { Navigate, useParams } from 'react-router-dom';

export default function ProductSettlementDetailPage() {
  const { id } = useParams();
  return (
    <Navigate
      to={id ? `/product-settlement/edit/${id}` : '/product-settlement'}
      replace
    />
  );
}
