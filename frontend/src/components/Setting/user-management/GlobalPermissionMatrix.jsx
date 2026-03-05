import React, { useState, useEffect } from 'react';
import { useGetAllPossiblePermissionsQuery, useGetUserPermissionsQuery, useUpdateUserPermissionsMutation } from '../../../redux/api/authApi';
import { ArrowLeft, Save } from 'lucide-react';
import Loader from '../../common-components/loader/Loader';
import { toast } from 'react-toastify';

const GlobalPermissionMatrix = ({ user, onBack }) => {
    const { data: allPermissionsData, isLoading: isLoadingAll, error: errorAll } = useGetAllPossiblePermissionsQuery();
    const { data: userPermissionsData, isLoading: isLoadingUser, error: errorUser } = useGetUserPermissionsQuery(user.id);
    const [updateUserPermissions, { isLoading: isUpdating }] = useUpdateUserPermissionsMutation();

    const [permissions, setPermissions] = useState([]);

    const permissionsString = JSON.stringify(userPermissionsData?.permissions);

    useEffect(() => {
        if (permissionsString) {
            setPermissions(JSON.parse(permissionsString));
        }
    }, [permissionsString]);

    const handleCheckboxChange = (featureName, accessType) => {
        setPermissions(currentPermissions => {
            const newPermissions = JSON.parse(JSON.stringify(currentPermissions));
            const feature = newPermissions.find(p => p.feature === featureName);

            if (feature) {
                const accessIndex = feature.access.indexOf(accessType);
                if (accessIndex > -1) {
                    feature.access.splice(accessIndex, 1);
                } else {
                    feature.access.push(accessType);
                }
            } else {
                newPermissions.push({ feature: featureName, access: [accessType] });
            }
            return newPermissions;
        });
    };

    const handleSave = async () => {
        try {
            await updateUserPermissions({ id: user.id, permissions }).unwrap();
            toast.success('Permissions updated successfully!');
            onBack();
        } catch (error) {
            toast.error('Failed to update permissions.');
            console.error('Error updating permissions:', error);
        }
    };

    if (isLoadingAll || isLoadingUser) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader />
            </div>
        );
    }

    if (errorAll || errorUser) {
        return <div className="p-6 text-center text-red-500">Error loading permissions data.</div>;
    }

    const masterPermissions = allPermissionsData?.permissions?.superadmin || [];
    const allAccessTypes = [...new Set(masterPermissions.flatMap(p => p.access))];

    return (
        <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Global Permissions for {user.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Role: <span className="font-medium capitalize">{user.role}</span>
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition-colors"
                >
                    <Save size={16} />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                            {allAccessTypes.map(accessType => (
                                <th key={accessType} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {accessType}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {masterPermissions.map(({ feature: featureName }) => (
                            <tr key={featureName} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{featureName}</td>
                                {allAccessTypes.map(accessType => {
                                    const featurePermission = permissions.find(p => p.feature === featureName);
                                    const isChecked = featurePermission ? featurePermission.access.includes(accessType) : false;
                                    return (
                                        <td key={accessType} className="px-6 py-4 whitespace-nowrap text-center">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                                                checked={isChecked}
                                                onChange={() => handleCheckboxChange(featureName, accessType)}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GlobalPermissionMatrix;
