import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const Pops = ({ onClose }) => {
  const successMessage = "Post published successfully!";

  // Automatically close the popup after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer); // Cleanup timer if component unmounts
  }, [onClose]);

  return (
    // Changed: 'items-start' and 'pt-10' to position at the top
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-10 pointer-events-none">
      
      {/* Popup Box */}
      <div className="bg-white rounded-xl p-4 shadow-2xl flex items-center gap-3 w-full max-w-sm animate-in slide-in-from-top duration-300 pointer-events-auto border border-gray-100">
        
        {/* Green Tick Icon */}
        <div className="bg-green-100 p-1.5 rounded-full">
          <CheckCircle size={20} className="text-green-500" />
        </div>

        {/* Success Message */}
        <h2 className="text-sm text-gray-700">
          {successMessage}
        </h2>
      </div>
    </div>
  );
};

export default Pops;