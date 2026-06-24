import DashboardCards from '../components/DashboardCards';
import DashboardCharts from '../components/DashboardCharts'; // Import the new chart

const Dashboard = () => {
  return (
    <div className="animate-fade-in text-left">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-500">Welcome back! Here is what's happening today.</p>
      </div>

      {/* Render the Statistics Cards */}
      <DashboardCards />

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Replace the old placeholder with the new component */}
        <DashboardCharts />
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[300px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {/* Simple activity list */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-600">Sarah Jenkins onboarded.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-600">Q3 Payroll processed.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm text-gray-600">Leave request: Mike Ross.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;