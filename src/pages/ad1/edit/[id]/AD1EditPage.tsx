import { AD1EditView } from '@/modules/purchase';
import { DayStartEntryGuard } from '@/modules/dayEndStartProcess';

const AD1EditPage = () => {
  return (
    <DayStartEntryGuard>
      <AD1EditView />
    </DayStartEntryGuard>
  );
};

export default AD1EditPage;
