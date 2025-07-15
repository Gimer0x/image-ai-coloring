import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

const ImagePreview = ({ imageUrl, alt }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
      {/* Image Container */}
      <div className="relative overflow-hidden" style={{ minHeight: '200px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>Failed to load image</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-primary-600 hover:text-primary-700 text-sm mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <img
          src={imageUrl}
          alt={alt}
          className={`w-full h-auto transition-all duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button
          onClick={handleZoomOut}
          disabled={scale <= 0.25}
          className="p-2 bg-white bg-opacity-90 rounded-lg shadow-md hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-gray-700" />
        </button>
        
        <button
          onClick={handleZoomIn}
          disabled={scale >= 3}
          className="p-2 bg-white bg-opacity-90 rounded-lg shadow-md hover:bg-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-gray-700" />
        </button>
        
        <button
          onClick={handleRotate}
          className="p-2 bg-white bg-opacity-90 rounded-lg shadow-md hover:bg-opacity-100 transition-all"
          title="Rotate"
        >
          <RotateCw className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Scale Indicator */}
      {scale !== 1 && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Reset Button */}
      {(scale !== 1 || rotation !== 0) && (
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm hover:bg-opacity-90 transition-all"
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default ImagePreview; 