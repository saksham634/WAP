import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 w-full">
      {/* Search Bar */}
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
        <Search className="text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Search employees, departments..." 
          className="bg-transparent border-none outline-none ml-2 w-full text-sm text-gray-700"
        />
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
          <Bell size={24} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 cursor-pointer border-l pl-6 border-gray-200">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <User size={20} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">HR Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;