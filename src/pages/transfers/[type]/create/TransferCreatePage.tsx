import { useParams } from 'react-router-dom';
import { TransferFormView } from '@/modules/transfers/views/TransferFormView';
import { TransferTypeEnum } from '@/modules/transfers/types';

const TransferCreatePage = () => {
  const { type } = useParams<{ type: string }>();
  const transferType =
    type?.toUpperCase() === TransferTypeEnum.BRANCH
      ? TransferTypeEnum.BRANCH
      : TransferTypeEnum.COUNTER;

  return <TransferFormView transferType={transferType} />;
};

export default TransferCreatePage;
