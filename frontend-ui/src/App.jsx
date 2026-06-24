
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees'; // Add this import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          
          {/* Replace the placeholder with the actual component */}
          <Route path="employees" element={<Employees />} />
          
          <Route path="attendance" element={<div className="p-6 text-xl">Attendance Page Coming Soon</div>} />
          <Route path="payroll" element={<div className="p-6 text-xl">Payroll Page Coming Soon</div>} />
          <Route path="settings" element={<div className="p-6 text-xl">Settings Page Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;