import {
  QueryProvider,
  AuthProvider,
  MasterPagesProvider,
  ThemeProvider,
} from './lib';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router';

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <MasterPagesProvider>
          <AuthProvider>
            <div className="min-h-screen text-text-primary">
              <AppRouter />
              <Toaster position="top-right" />
            </div>
          </AuthProvider>
        </MasterPagesProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
