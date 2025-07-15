import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ onImageUpload, isProcessing, fileInputRef }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (PNG or JPEG)');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    onImageUpload(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        className={`upload-area ${isDragOver ? 'dragover' : ''} ${
          isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="loading-spinner mb-4"></div>
            <p className="text-gray-600">Processing your image...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {selectedFile ? 'Drop a new image here' : 'Drop your image here'}
            </p>
            <p className="text-gray-500 mb-4">
              or click to browse files
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <ImageIcon className="w-4 h-4 mr-1" />
              <span>PNG, JPEG up to 10MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isProcessing}
      />

      {/* Selected File Info */}
      {selectedFile && !isProcessing && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <ImageIcon className="w-5 h-5 text-green-600 mr-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                {selectedFile.name}
              </p>
              <p className="text-xs text-green-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>Tips for best results:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Use high-quality images with clear subjects</li>
          <li>Images with simple backgrounds work best</li>
          <li>Ensure good contrast between subject and background</li>
          <li>Supported formats: PNG, JPEG (max 10MB)</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploader; 