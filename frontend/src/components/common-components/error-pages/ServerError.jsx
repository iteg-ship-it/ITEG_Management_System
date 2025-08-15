const ServerError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">405</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Method Not Allowed</h2>
        <p className="text-gray-600 mb-8">The request method is not supported for this resource.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors mr-4"
        >
          Retry
        </button>
        <button 
          onClick={() => window.history.back()}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ServerError;

