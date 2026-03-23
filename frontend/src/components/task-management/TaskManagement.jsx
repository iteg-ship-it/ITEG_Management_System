import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import TabsCommon from '../common-components/table/TabsCommon';
import CommonTable from '../common-components/table/CommonTable';
import OrangeButton from '../common-components/sidebar/OrangeButton';
import InputField from '../common-components/common-feild/InputField';
import CustomDropdown from '../common-components/common-feild/CustomDropdown';

const TaskManagement = () => {
  const { hasPermission } = usePermissions();
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Tasks');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: '',
    dueDate: ''
  });

  const tabs = ['All Tasks', 'My Tasks', 'Completed'];
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const mockTasks = [
        {
          id: 1,
          title: 'Review Student Applications',
          description: 'Review and process new student applications for admission',
          priority: 'high',
          status: 'pending',
          assignedTo: 'John Doe',
          dueDate: '2024-01-15',
          createdAt: '2024-01-01'
        },
        {
          id: 2,
          title: 'Update Course Curriculum',
          description: 'Update curriculum for Computer Science courses',
          priority: 'medium',
          status: 'in-progress',
          assignedTo: 'Jane Smith',
          dueDate: '2024-01-20',
          createdAt: '2024-01-02'
        }
      ];
      setTasks(mockTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (editingTask) {
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? { ...task, ...formData } : task
        ));
      } else {
        const newTask = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setTasks([...tasks, newTask]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate
    });
    setShowCreateDrawer(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      assignedTo: '',
      dueDate: ''
    });
    setEditingTask(null);
    setShowCreateDrawer(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'My Tasks') {
      return matchesSearch && task.assignedTo === 'Current User';
    }
    if (activeTab === 'Completed') {
      return matchesSearch && task.status === 'completed';
    }
    return matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const columns = [
    {
      key: 'task',
      label: 'Task',
      render: (task) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{task.title}</div>
          <div className="text-sm text-gray-500">{task.description}</div>
        </div>
      )
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (task) => <span className="text-sm text-gray-900">{task.assignedTo}</span>
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (task) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (task) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (task) => <span className="text-sm text-gray-900">{task.dueDate}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (task) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(task)}
            className="text-orange-600 hover:text-orange-900"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(task.id)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">Manage and track tasks across the institution</p>
        </div>
        <OrangeButton
          buttonTitle="+ Add New Task"
          panelTitle="Create New Task"
          drawerContent={
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter assignee name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          }
          rightBtnText="Create Task"
          onRightClick={handleSubmit}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <TabsCommon
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        <CommonTable
          data={filteredTasks}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default TaskManagement;