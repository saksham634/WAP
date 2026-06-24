import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, FileText, Settings } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Employees', icon: <Users size={20} />, path: '/employees' },
    { name: 'Attendance', icon: <Calendar size={20} />, path: '/attendance' },
    { name: 'Payroll', icon: <FileText size={20} />, path: '/payroll' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-5 flex items-center justify-center border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-wider text-blue-400">EMS Portal</h1>
      </div>
      
      <nav className="flex-1 mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;