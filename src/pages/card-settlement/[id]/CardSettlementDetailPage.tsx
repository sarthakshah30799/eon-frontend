import { Navigate, useParams } from 'react-router-dom';

export default function CardSettlementLegacyDetailRedirect() {
  const { id } = useParams();
  return (
    <Navigate
      to={id ? `/card-settlement/edit/${id}` : '/card-settlement'}
      replace
    />
  );
}
