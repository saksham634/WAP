import { Users, UserCheck, Clock, TrendingUp } from 'lucide-react';

const Card = ({ title, value, icon, trend, trendColor }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      <p className={`text-sm mt-2 font-medium ${trendColor}`}>
        {trend}
      </p>
    </div>
    <div className="bg-blue-50 p-4 rounded-full text-blue-600">
      {icon}
    </div>
  </div>
);

const DashboardCards = () => {
  const stats = [
    {
      title: "Total Employees",
      value: "248",
      icon: <Users size={28} />,
      trend: "+12% from last month",
      trendColor: "text-green-500"
    },
    {
      title: "Present Today",
      value: "230",
      icon: <UserCheck size={28} />,
      trend: "92% Attendance Rate",
      trendColor: "text-blue-500"
    },
    {
      title: "On Leave",
      value: "18",
      icon: <Clock size={28} />,
      trend: "-2% from yesterday",
      trendColor: "text-green-500"
    },
    {
      title: "New Hires",
      value: "14",
      icon: <TrendingUp size={28} />,
      trend: "This quarter",
      trendColor: "text-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardCards;