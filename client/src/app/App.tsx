import { Toaster } from '@/components/ui/sonner'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/features/landing'
import { LoginPage, SignupPage } from '@/features/authentication';

const App = () => (
  <Router>
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />
      </Routes>
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors={true}
      />
    </div>
  </Router>
);

export default App;