// React import not required with new JSX transform
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', attendance: 220 },
  { name: 'Tue', attendance: 230 },
  { name: 'Wed', attendance: 235 },
  { name: 'Thu', attendance: 228 },
  { name: 'Fri', attendance: 240 },
  { name: 'Sat', attendance: 210 },
  { name: 'Sun', attendance: 205 },
];

const DashboardCharts = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2 min-h-[300px]">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Attendance Trends</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="attendance" stroke="#2563eb" fillOpacity={1} fill="url(#colorAttendance)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;