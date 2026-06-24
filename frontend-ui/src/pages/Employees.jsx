import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import AddEmployeeModal from '../components/AddEmployeeModal';

const mockEmployees = [
  { id: 'EMP001', name: 'Sarah Jenkins', role: 'Frontend Developer', department: 'Engineering', status: 'Active' },
  { id: 'EMP002', name: 'Mike Ross', role: 'Backend Developer', department: 'Engineering', status: 'On Leave' },
  { id: 'EMP003', name: 'Anita Patel', role: 'HR Manager', department: 'Human Resources', status: 'Active' },
  { id: 'EMP004', name: 'David Chen', role: 'Product Manager', department: 'Product', status: 'Active' },
];

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="animate-fade-in">
        <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employee Directory</h2>
          <p className="text-gray-500">Manage your team members and their roles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 flex justify-between items-center">
        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 w-72 border border-gray-200">
          <Search className="text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            className="bg-transparent border-none outline-none ml-2 w-full text-sm text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white border border-gray-100 rounded-b-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
              <th className="p-4 font-medium">Employee ID</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Department</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockEmployees.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-medium text-gray-900">{emp.id}</td>
                <td className="p-4 text-sm text-gray-700">{emp.name}</td>
                <td className="p-4 text-sm text-gray-600">{emp.role}</td>
                <td className="p-4 text-sm text-gray-600">{emp.department}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-3 text-gray-400">
                  <button className="hover:text-blue-600 transition-colors"><Edit size={18} /></button>
                  <button className="hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;