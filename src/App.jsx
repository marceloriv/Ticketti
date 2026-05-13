import { AuthProvider } from '@contexts/auth';
import AppRoutes from '@routes/AppRoutes';
import '@styles/brand.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
