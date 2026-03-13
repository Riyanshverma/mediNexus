import { Toaster } from '@/components/ui/sonner'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/features/landing'

const App = () => (
  <Router>
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<LandingPage />} />
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