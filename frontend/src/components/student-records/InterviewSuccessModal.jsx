/* eslint-disable react/prop-types */
import { useEffect } from 'react';

const InterviewSuccessModal = ({ isOpen, onClose, studentName, currentLevel, nextLevel, result }) => {
    // Auto close after 5 seconds
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getResultIcon = () => {
        switch (result) {
            case 'Pass':
                return '✅';
            case 'Fail':
                return '❌';
            default:
                return '⏳';
        }
    };

    const getResultColor = () => {
        switch (result) {
            case 'Pass':
                return 'text-green-600';
            case 'Fail':
                return 'text-red-600';
            default:
                return 'text-yellow-600';
        }
    };

    const getProgressMessage = () => {
        if (result === 'Pass') {
            return `${currentLevel} → ${nextLevel}`;
        } else if (result === 'Fail') {
            return `Remains at ${currentLevel}`;
        } else {
            return `Status: ${result}`;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-100">
                <div className="text-center">
                    {/* Result Icon */}
                    <div className="text-6xl mb-4">
                        {getResultIcon()}
                    </div>
                    
                    {/* Student Name */}
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {studentName}
                    </h2>
                    
                    {/* Result Status */}
                    <p className={`text-lg font-semibold mb-4 ${getResultColor()}`}>
                        Interview {result}
                    </p>
                    
                    {/* Level Progress */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-1">Level Progress</p>
                        <p className="text-xl font-bold text-gray-800">
                            {getProgressMessage()}
                        </p>
                    </div>
                    
                    {/* Auto close message */}
                    <p className="text-xs text-gray-500">
                        This message will close automatically in 5 seconds
                    </p>
                </div>
                
                {/* Manual close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700 transition-colors"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default InterviewSuccessModal;