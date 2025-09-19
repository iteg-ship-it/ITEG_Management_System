/* eslint-disable react/prop-types */
import { useState } from 'react';
import BlurBackground from './BlurBackground';

// Test component to verify blur background is working
const BlurBackgroundTest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4">
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Blur Background
      </button>

      <BlurBackground isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Test Modal</h2>
          <p className="mb-4">This modal should have a blurred background!</p>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </BlurBackground>
    </div>
  );
};

export default BlurBackgroundTest;