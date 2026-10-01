import { Navigate, useParams } from 'react-router-dom';

export default function ProductSurrenderDetailPage() {
  const { id } = useParams();
  return (
    <Navigate
      to={id ? `/product-surrender/edit/${id}` : '/product-surrender'}
      replace
    />
  );
}
