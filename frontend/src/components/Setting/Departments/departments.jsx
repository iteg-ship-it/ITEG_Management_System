import { Building2, Users, GraduationCap, Code, Briefcase, Calculator } from 'lucide-react';

const DepartmentSection = () => {
  const departments = [
    {
      name: '',
      icon: Code,
      students: 45,
      color: '#3B82F6',
      description: 'Software Development & Programming'
    },
    {
      name: 'Information Technology',
      icon: Building2,
      students: 38,
      color: '#10B981',
      description: 'IT Infrastructure & Systems'
    },
    {
      name: 'Business Administration',
      icon: Briefcase,
      students: 32,
      color: '#8B5CF6',
      description: 'Management & Leadership'
    },
    {
      name: 'Accounting',
      icon: Calculator,
      students: 28,
      color: '#F59E0B',
      description: 'Finance & Accounting'
    }
  ];

  return (
    <div className="bg-white rounded-xl overflow-hidden mb-8" style={{ boxShadow: '0 0 22px 6px rgba(0, 0, 0, 0.09)' }}>
      <div className="px-6 py-4 border-b-2 border-gray-200 shadow-sm bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
            <GraduationCap className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Departments</h3>
            <p className="text-sm text-gray-600">Academic departments overview</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept, index) => {
            const IconComponent = dept.icon;
            return (
              <div key={index} className="group relative bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${dept.color}20` }}>
                      <IconComponent className="h-6 w-6" style={{ color: dept.color }} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: dept.color }}>{dept.students}</div>
                      <div className="text-xs text-gray-500">Students</div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{dept.name}</h4>
                  <p className="text-sm text-gray-600">{dept.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DepartmentSection;