import {
  QueryProvider,
  AuthProvider,
  MasterPagesProvider,
} from './lib';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router';

function App() {
  return (
    <QueryProvider>
      <MasterPagesProvider>
        <AuthProvider>
          <div className="min-h-screen bg-transparent text-text-primary">
            <AppRouter />
            <Toaster position="top-right" />
          </div>
        </AuthProvider>
      </MasterPagesProvider>
    </QueryProvider>
  );
}

export default App;
