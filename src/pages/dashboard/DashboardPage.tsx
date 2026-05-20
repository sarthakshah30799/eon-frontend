import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { Button } from '../../components/ui/button1/Button';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Maraekat Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Welcome, {user?.name || user?.email || 'User'}!
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You are successfully logged in!
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            This is a dashboard. From here, you can navigate to other parts of
            the application once they are built.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 border rounded-xl bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Profile</h3>
              <p className="text-sm text-gray-600 mb-4">
                View and manage your account details and settings.
              </p>
              <Button variant="outline" className="w-full">
                Go to Profile
              </Button>
            </div>
            <div className="p-6 border rounded-xl bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Transactions</h3>
              <p className="text-sm text-gray-600 mb-4">
                View your recent currency exchange transactions.
              </p>
              <Button variant="outline" className="w-full">
                View Transactions
              </Button>
            </div>
            <div className="p-6 border rounded-xl bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Market Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Explore live currency rates and market trends.
              </p>
              <Button variant="outline" className="w-full">
                View Market
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
