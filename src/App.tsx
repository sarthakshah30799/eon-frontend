import { QueryProvider, AuthProvider } from './lib';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <div className="min-h-screen bg-white text-gray-900">
          <AppRouter />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
