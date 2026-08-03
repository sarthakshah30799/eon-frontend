import { useParams } from 'react-router-dom';
import { TransferListView } from '@/modules/transfers/views/TransferListView';
import { TransferTypeEnum } from '@/modules/transfers/types';

const TransferListPage = () => {
  const { type } = useParams<{ type: string }>();
  const transferType =
    type?.toUpperCase() === TransferTypeEnum.BRANCH
      ? TransferTypeEnum.BRANCH
      : TransferTypeEnum.COUNTER;

  return <TransferListView transferType={transferType} />;
};

export default TransferListPage;
