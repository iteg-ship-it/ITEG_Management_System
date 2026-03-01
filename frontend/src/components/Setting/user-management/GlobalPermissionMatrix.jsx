import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';

const GlobalPermissionMatrix = ({ user, onBack }) => {
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(false);

    // Define all modules and their permissions
    const modules = [
        {
            name: 'Dashboard',
            key: 'dashboard',
            permissions: ['view']
        },
        {
            name: 'Student Records',
            key: 'student_records',
            permissions: ['view', 'create', 'edit', 'delete']
        },
        {
            name: 'Task Management',
            key: 'task_management',
            permissions: ['view', 'create', 'edit', 'delete', 'approve']
        },
        {
            name: 'User Management',
            key: 'user_management',
            permissions: ['view', 'create', 'edit', 'delete']
        },
        {
            name: 'Reports',
            key: 'reports',
            permissions: ['view', 'create', 'edit', 'delete']
        },
        {
            name: 'Settings',
            key: 'settings',
            permissions: ['view', 'edit']
        },
        {
            name: 'Roles & Permissions',
            key: 'roles_permissions',
            permissions: ['view', 'create', 'edit', 'delete']
        },
        {
            name: 'Academic Calendar',
            key: 'academic_calendar',
            permissions: ['view', 'create', 'edit', 'delete']
        },
        {
            name: 'Notifications',
            key: 'notifications',
            permissions: ['view', 'create', 'edit', 'delete']
        },
        {
            name: 'File Management',
            key: 'file_management',
            permissions: ['view', 'create', 'edit', 'delete']
        }
    ];

    // Initialize permissions based on user role
    useEffect(() => {
        const initPermissions = {};
        modules.forEach(module => {
            initPermissions[module.key] = {};
            module.permissions.forEach(permission => {
                // Set default permissions based on role
                if (user.role === 'superadmin') {
                    initPermissions[module.key][permission] = true;
                } else if (user.role === 'admin') {
                    initPermissions[module.key][permission] = permission !== 'delete';
                } else if (user.role === 'faculty') {
                    initPermissions[module.key][permission] = ['view', 'create', 'edit'].includes(permission);
                } else {
                    initPermissions[module.key][permission] = permission === 'view';
                }
            });
        });
        setPermissions(initPermissions);
    }, [user.role]);

    const handlePermissionChange = (moduleKey, permission, checked) => {
        setPermissions(prev => ({
            ...prev,
            [moduleKey]: {
                ...prev[moduleKey],
                [permission]: checked
            }
        }));
    };

    const handleSelectAll = (moduleKey, checked) => {
        setPermissions(prev => ({
            ...prev,
            [moduleKey]: Object.keys(prev[moduleKey]).reduce((acc, permission) => {
                acc[permission] = checked;
                return acc;
            }, {})
        }));
    };

    const handleSavePermissions = async () => {
        setLoading(true);
        try {
            // API call to save permissions
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            toast.success('Permissions updated successfully');
        } catch (error) {
            toast.error('Failed to update permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPermissions = () => {
        const initPermissions = {};
        modules.forEach(module => {
            initPermissions[module.key] = {};
            module.permissions.forEach(permission => {
                initPermissions[module.key][permission] = permission === 'view';
            });
        });
        setPermissions(initPermissions);
        toast.info('Permissions reset to default');
    };

    const getPermissionColor = (permission) => {
        const colors = {
            view: 'text-blue-600',
            create: 'text-green-600',
            edit: 'text-yellow-600',
            delete: 'text-red-600',
            approve: 'text-purple-600'
        };
        return colors[permission] || 'text-gray-600';
    };

    // return (
    //     <div className="min-h-screen bg-gray-50 p-6">
    //         <div className="max-w-7xl mx-auto">
    //             {/* Header */}
    //             <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
    //                 <div className="flex items-center justify-between">
    //                     <div className="flex items-center gap-4">
    //                         <button
    //                             onClick={onBack}
    //                             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
    //                         >
    //                             <ArrowLeft size={20} className="text-gray-600" />
    //                         </button>
    //                         <div>
    //                             <h1 className="text-2xl font-bold text-gray-900">Global Permission Matrix</h1>
    //                             <p className="text-gray-600 mt-1">
    //                                 Managing permissions for <span className="font-semibold text-[#FDA92D]">{user.name}</span> 
    //                                 <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">{user.role}</span>
    //                             </p>
    //                         </div>
    //                     </div>
    //                     <div className="flex gap-3">
    //                         <button
    //                             onClick={handleResetPermissions}
    //                             className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
    //                         >
    //                             <RotateCcw size={16} />
    //                             Reset
    //                         </button>
    //                         <button
    //                             onClick={handleSavePermissions}
    //                             disabled={loading}
    //                             className="flex items-center gap-2 px-6 py-2 bg-[#FDA92D] text-white rounded-lg hover:bg-[#e8941a] transition-colors disabled:opacity-50"
    //                         >
    //                             <Save size={16} />
    //                             {loading ? 'Saving...' : 'Save Changes'}
    //                         </button>
    //                     </div>
    //                 </div>
    //             </div>

    //             {/* Permission Matrix Table */}
    //             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    //                 <div className="overflow-x-auto">
    //                     <table className="w-full">
    //                         <thead className="bg-gray-50 border-b">
    //                             <tr>
    //                                 <th className="text-left py-4 px-6 font-semibold text-gray-900 min-w-[200px]">
    //                                     Module
    //                                 </th>
    //                                 <th className="text-center py-4 px-4 font-semibold text-blue-600 min-w-[100px]">
    //                                     View
    //                                 </th>
    //                                 <th className="text-center py-4 px-4 font-semibold text-green-600 min-w-[100px]">
    //                                     Create
    //                                 </th>
    //                                 <th className="text-center py-4 px-4 font-semibold text-yellow-600 min-w-[100px]">
    //                                     Edit
    //                                 </th>
    //                                 <th className="text-center py-4 px-4 font-semibold text-red-600 min-w-[100px]">
    //                                     Delete
    //                                 </th>
    //                                 <th className="text-center py-4 px-4 font-semibold text-purple-600 min-w-[100px]">
    //                                     Approve
    //                                 </th>
    //                                 <th className="text-center py-4 px-4 font-semibold text-gray-600 min-w-[100px]">
    //                                     Select All
    //                                 </th>
    //                             </tr>
    //                         </thead>
    //                         <tbody>
    //                             {modules.map((module, index) => (
    //                                 <tr key={module.key} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
    //                                     <td className="py-4 px-6 font-medium text-gray-900">
    //                                         {module.name}
    //                                     </td>
    //                                     {['view', 'create', 'edit', 'delete', 'approve'].map(permission => (
    //                                         <td key={permission} className="text-center py-4 px-4">
    //                                             {module.permissions.includes(permission) ? (
    //                                                 <input
    //                                                     type="checkbox"
    //                                                     checked={permissions[module.key]?.[permission] || false}
    //                                                     onChange={(e) => handlePermissionChange(module.key, permission, e.target.checked)}
    //                                                     className="w-4 h-4 text-[#FDA92D] bg-gray-100 border-gray-300 rounded focus:ring-[#FDA92D] focus:ring-2"
    //                                                 />
    //                                             ) : (
    //                                                 <span className="text-gray-300">—</span>
    //                                             )}
    //                                         </td>
    //                                     ))}
    //                                     <td className="text-center py-4 px-4">
    //                                         <input
    //                                             type="checkbox"
    //                                             checked={module.permissions.every(permission => 
    //                                                 permissions[module.key]?.[permission] || false
    //                                             )}
    //                                             onChange={(e) => handleSelectAll(module.key, e.target.checked)}
    //                                             className="w-4 h-4 text-[#FDA92D] bg-gray-100 border-gray-300 rounded focus:ring-[#FDA92D] focus:ring-2"
    //                                         />
    //                                     </td>
    //                                 </tr>
    //                             ))}
    //                         </tbody>
    //                     </table>
    //                 </div>
    //             </div>

    //             {/* Permission Summary */}
    //             <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
    //                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Permission Summary</h3>
    //                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
    //                     {['view', 'create', 'edit', 'delete', 'approve'].map(permission => {
    //                         const count = Object.values(permissions).reduce((acc, modulePerms) => {
    //                             return acc + (modulePerms[permission] ? 1 : 0);
    //                         }, 0);
    //                         return (
    //                             <div key={permission} className="text-center p-4 bg-gray-50 rounded-lg">
    //                                 <div className={`text-2xl font-bold ${getPermissionColor(permission)}`}>
    //                                     {count}
    //                                 </div>
    //                                 <div className="text-sm text-gray-600 capitalize mt-1">
    //                                     {permission} Access
    //                                 </div>
    //                             </div>
    //                         );
    //                     })}
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // );

    return (
    <div className="">

        {/* Matrix Section */}
        <div>
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Global Permissions Matrix
                    </h2>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                        Editing: {user.role}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-6">

                {/* Card Header */}
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-semibold text-gray-800">
                        Permissions Matrix
                    </h3>

                    <div className="flex gap-4 text-sm">
                        <button
                            onClick={() => {
                                const updated = {};
                                modules.forEach(m => {
                                    updated[m.key] = {};
                                    m.permissions.forEach(p => {
                                        updated[m.key][p] = true;
                                    });
                                });
                                setPermissions(updated);
                            }}
                            className="text-[#FDA92D] font-medium hover:underline"
                        >
                            Select All
                        </button>

                        <button
                            onClick={() => {
                                const updated = {};
                                modules.forEach(m => {
                                    updated[m.key] = {};
                                    m.permissions.forEach(p => {
                                        updated[m.key][p] = false;
                                    });
                                });
                                setPermissions(updated);
                            }}
                            className="text-gray-400 hover:underline"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                                <th className="text-left px-6 py-3">Module</th>
                                <th className="text-center px-6 py-3">View</th>
                                <th className="text-center px-6 py-3">Create</th>
                                <th className="text-center px-6 py-3">Edit</th>
                                <th className="text-center px-6 py-3">Delete</th>
                                <th className="text-center px-6 py-3">Approve</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {modules.map((module, index) => (
                                <tr key={module.key} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-700">
                                        {module.name}
                                    </td>

                                    {['view', 'create', 'edit', 'delete', 'approve'].map(permission => (
                                        <td key={permission} className="text-center px-6 py-4">
                                            {module.permissions.includes(permission) ? (
                                                <input
                                                    type="checkbox"
                                                    checked={permissions[module.key]?.[permission] || false}
                                                    onChange={(e) =>
                                                        handlePermissionChange(
                                                            module.key,
                                                            permission,
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="w-4 h-4 text-[#FDA92D] border-gray-300 rounded focus:ring-[#FDA92D]"
                                                />
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    </div>
);
};

export default GlobalPermissionMatrix;