/* eslint-disable react/prop-types */
const SessionTimeoutModal = ({ isOpen, onContinue, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl py-4 px-6 w-full max-w-lg relative">
        <h2 className="text-xl font-bold text-center text-orange-500 mb-4">Session Timeout Warning</h2>
        
        <div className="text-center mb-6">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 text-base leading-relaxed">
            Your session is about to expire in 5 minutes. Would you like to continue your session or logout?
          </p>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onLogout}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          >
            Logout
          </button>
          <button
            onClick={onContinue}
            className="bg-[#FDA92D]  text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Continue Session
          </button>
        </div>
        
        <button
          onClick={onLogout}
          className="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;