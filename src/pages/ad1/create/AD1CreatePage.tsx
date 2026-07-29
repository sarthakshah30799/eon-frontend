import { AD1CreateView } from '@/modules/purchase';
import { DayStartEntryGuard } from '@/modules/dayEndStartProcess';

const AD1CreatePage = () => {
  return (
    <DayStartEntryGuard>
      <AD1CreateView />
    </DayStartEntryGuard>
  );
};

export default AD1CreatePage;
