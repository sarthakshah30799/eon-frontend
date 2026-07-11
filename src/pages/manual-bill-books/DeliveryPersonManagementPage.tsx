import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { manualBillBookApi } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';

type BranchUser = { id: string; name: string; isDeliveryPerson: boolean };

export const DeliveryPersonManagementPage = () => {
  const { activeBranchId } = useAuth();
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading } = useQuery<BranchUser[]>({
    queryKey: ['dp-management-users', activeBranchId],
    queryFn: () => manualBillBookApi.getBranchUsersForDP(),
    enabled: !!activeBranchId,
  });

  const handleToggle = async (user: BranchUser) => {
    setLoadingId(user.id);
    try {
      if (user.isDeliveryPerson) {
        await manualBillBookApi.removeDeliveryPerson(user.id);
        toast.success(`${user.name} removed as delivery person.`);
      } else {
        await manualBillBookApi.addDeliveryPerson(user.id);
        toast.success(`${user.name} added as delivery person.`);
      }
      await queryClient.invalidateQueries({ queryKey: ['dp-management-users'] });
      // also refresh the DP dropdown list
      await queryClient.invalidateQueries({ queryKey: ['delivery-persons'] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const deliveryPersons = filtered.filter(u => u.isDeliveryPerson);
  const others = filtered.filter(u => !u.isDeliveryPerson);

  if (!activeBranchId) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-slate-500 font-medium">
          Please select your active branch workplace to proceed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Delivery Person Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Assign or remove delivery person access for users in your branch.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
          <span className="ml-3 text-sm text-slate-500">Loading users...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-slate-500">No active users found in this branch.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Delivery Persons */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-emerald-50">
              <h2 className="text-sm font-semibold text-emerald-800">
                Current Delivery Persons
                <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {deliveryPersons.length}
                </span>
              </h2>
            </div>
            {deliveryPersons.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                No delivery persons assigned yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {deliveryPersons.map(user => (
                  <li key={user.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{user.name}</span>
                    </div>
                    <button
                      onClick={() => handleToggle(user)}
                      disabled={loadingId === user.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      {loadingId === user.id ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border border-rose-400 border-t-transparent" />
                      ) : (
                        <UserMinusIcon className="h-3.5 w-3.5" />
                      )}
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Other Branch Users */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-700">
                Other Branch Users
                <span className="ml-2 inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {others.length}
                </span>
              </h2>
            </div>
            {others.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                All branch users are already assigned as delivery persons.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {others.map(user => (
                  <li key={user.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{user.name}</span>
                    </div>
                    <button
                      onClick={() => handleToggle(user)}
                      disabled={loadingId === user.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      {loadingId === user.id ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border border-sky-400 border-t-transparent" />
                      ) : (
                        <UserPlusIcon className="h-3.5 w-3.5" />
                      )}
                      Add as DP
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default DeliveryPersonManagementPage;
