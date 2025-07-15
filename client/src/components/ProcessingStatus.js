import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const ProcessingStatus = ({ status }) => {
  const isCompleted = status.includes('completed') || status.includes('success');
  const isError = status.includes('failed') || status.includes('error');

  return (
    <div className="flex items-center justify-center p-6">
      <div className="flex items-center space-x-4">
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : isError ? (
            <AlertCircle className="w-8 h-8 text-red-600" />
          ) : (
            <div className="loading-spinner w-8 h-8"></div>
          )}
        </div>

        {/* Status Text */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {isCompleted ? 'Processing Complete!' : 
             isError ? 'Processing Failed' : 'Processing Image'}
          </h3>
          <p className="text-gray-600">{status}</p>
        </div>
      </div>

      {/* Progress Animation */}
      {!isCompleted && !isError && (
        <div className="mt-4 w-full">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-primary-600 h-2 rounded-full animate-pulse" 
                 style={{ 
                   width: '100%',
                   animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                 }}>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            This may take a few moments...
          </p>
        </div>
      )}

      {/* Success Message */}
      {isCompleted && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              Your coloring page is ready! You can now download the PDF.
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {isError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">
              Something went wrong. Please try again with a different image.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus; 