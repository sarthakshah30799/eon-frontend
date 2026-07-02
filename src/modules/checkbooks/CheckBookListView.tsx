import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkbookApi, type ICheckBook } from '@/api';
import { branchProfileApi } from '@/api/branchProfile/branchProfile.api';
import { Modal } from '@/components/ui/modal/Modal';
import toast from 'react-hot-toast';
import { Loader } from '@/components/ui/loader';

export const CheckBookListView = () => {
  const [books, setBooks] = useState<ICheckBook[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string; code: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const navigate = useNavigate();

  // Review modal states
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedBook] = useState<ICheckBook | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBranches = async () => {
    try {
      const data = await branchProfileApi.getBranchProfiles({ activeOnly: true });
      setBranches(data.map(b => ({ id: b.id, name: b.name, code: b.code })));
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  };

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const data = await checkbookApi.findAll(
        branchFilter || undefined,
        statusFilter || undefined
      );
      setBooks(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load checkbook records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [branchFilter, statusFilter]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    try {
      setIsSubmitting(true);
      await checkbookApi.approveOrReject(selectedBook.id, {
        status: approvalStatus,
        approvalRemarks,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      toast.success(`Record has been successfully ${approvalStatus.toLowerCase()}.`);
      setIsReviewOpen(false);
      fetchBooks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Checkbook Management</h1>
          <p className="text-sm text-slate-500">Track and manage physical checkbook allocations and approvals.</p>
        </div>
        <button
          type="button"
          className="cursor-pointer bg-sky-600 hover:bg-sky-500 text-white rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition self-start md:self-auto"
          onClick={() => navigate('/admin/checkbooks/create')}
        >
          Create
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Records</h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Filter by Branch</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                ))}
              </select>
            </div>

            <div className="w-[150px]">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Filter by Status</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-md">
              No records found.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <th className="p-3">Date</th>
                    <th className="p-3">NO</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3">Txn Type</th>
                    <th className="p-3 text-center">Check Books From-To</th>
                    <th className="p-3 text-center">Leaves/Book</th>
                    <th className="p-3 text-center">Cheque From-To</th>
                    <th className="p-3">Assigned To</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 whitespace-nowrap">{book.dispatchDate}</td>
                      <td className="p-3 font-semibold text-slate-800">{book.no}</td>
                      <td className="p-3 font-medium">{book.branchCode || 'N/A'}</td>
                      <td className="p-3 whitespace-nowrap text-slate-600">{book.transactionType}</td>
                      <td className="p-3 text-center font-semibold text-sky-700">{book.bookNoFrom} - {book.bookNoTo}</td>
                      <td className="p-3 text-center">{book.vouchersPerBook}</td>
                      <td className="p-3 text-center font-medium text-emerald-700">{book.mvNoFrom} - {book.mvNoTo}</td>
                      <td className="p-3 whitespace-nowrap text-slate-600">{book.assignedTo}</td>
                      <td className="p-3">
                        <span
                          className={[
                            'px-2 py-0.5 rounded font-semibold text-[10px]',
                            book.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : book.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800',
                          ].join(' ')}
                        >
                          {book.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review / Details Modal */}
      {selectedBook && (
        <Modal
          open={isReviewOpen}
          onOpenChange={setIsReviewOpen}
          title={selectedBook.status === 'Pending' ? 'Review Dispatch Request' : 'Dispatch Details'}
          size="md"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 border border-slate-200 rounded-md">
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Voucher No</span>
                <span className="font-semibold text-slate-800">{selectedBook.no}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Date</span>
                <span className="text-slate-800">{selectedBook.dispatchDate}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Branch</span>
                <span className="text-slate-800">{selectedBook.branchName} ({selectedBook.branchCode})</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Txn Type</span>
                <span className="text-slate-800">{selectedBook.transactionType}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Book Range</span>
                <span className="font-semibold text-slate-800">{selectedBook.bookNoFrom} - {selectedBook.bookNoTo}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Leaves Per Book</span>
                <span className="text-slate-800">{selectedBook.vouchersPerBook}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Cheque Range</span>
                <span className="font-semibold text-slate-800">{selectedBook.mvNoFrom} - {selectedBook.mvNoTo}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-semibold mb-0.5">Assigned To</span>
                <span className="text-slate-800">{selectedBook.assignedTo}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-slate-400 font-semibold mb-0.5">Submitter Remarks</span>
                <span className="text-slate-700 block italic">{selectedBook.remarks || 'None'}</span>
              </div>
            </div>

            {selectedBook.status === 'Pending' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status Action</label>
                    <select
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs font-medium"
                      value={approvalStatus}
                      onChange={(e) => setApprovalStatus(e.target.value as 'Approved' | 'Rejected')}
                    >
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">From Date</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">To Date</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Approval Remarks</label>
                  <textarea
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs"
                    placeholder="Provide comments for approval or rejection..."
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    required={approvalStatus === 'Rejected'}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="cursor-pointer border border-slate-200 text-slate-600 hover:bg-slate-50 rounded px-4 py-2 text-xs font-semibold transition"
                    onClick={() => setIsReviewOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white rounded px-4 py-2 text-xs font-semibold shadow transition flex items-center gap-1.5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader />}
                    Submit Review
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Review Logs</h4>
                <div className="text-xs bg-slate-50 p-4 border border-slate-200 rounded-md space-y-2.5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-slate-400 font-semibold mb-0.5">Status</span>
                      <span
                        className={[
                          'px-1.5 py-0.5 rounded font-semibold text-[10px]',
                          selectedBook.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800',
                        ].join(' ')}
                      >
                        {selectedBook.status}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold mb-0.5">Date Range</span>
                      <span>{selectedBook.fromDate || 'N/A'} to {selectedBook.toDate || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold mb-0.5">Approval Remarks</span>
                    <span className="italic block text-slate-700">{selectedBook.approvalRemarks || 'None'}</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer border border-slate-200 text-slate-600 hover:bg-slate-50 rounded px-4 py-2 text-xs font-semibold transition"
                    onClick={() => setIsReviewOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CheckBookListView;
