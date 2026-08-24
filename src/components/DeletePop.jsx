import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const DeletePop = ({ onClose, isError = false }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-10 pointer-events-none">
      <div
        className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 w-full max-w-sm pointer-events-auto shadow-md animate-pop-scale"
        style={{ animation: 'slideDown 0.3s ease forwards' }}
      >
        <div className={`p-1.5 rounded-full ${isError ? 'bg-red-100' : 'bg-green-100'}`}>
          {isError
            ? <XCircle size={20} className="text-red-500" />
            : <CheckCircle size={20} className="text-green-500" />
          }
        </div>
        <h2 className="text-sm text-gray-800 font-medium">
          {isError ? 'Failed to delete post.' : 'Post deleted successfully!'}
        </h2>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DeletePop;