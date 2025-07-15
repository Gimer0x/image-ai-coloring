import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, Download, Image, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ImagePreview from './components/ImagePreview';
import ProcessingStatus from './components/ProcessingStatus';

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    try {
      setError(null);
      setProcessedImage(null);
      setDownloadUrl(null);
      setIsProcessing(true);
      setProcessingStatus('Uploading image...');

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Upload and process image
      const response = await axios.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProcessingStatus(`Uploading... ${percentCompleted}%`);
        },
      });

      if (response.data.success) {
        setUploadedImage(response.data.originalImage);
        setProcessedImage(response.data.processedImage);
        setDownloadUrl(response.data.pdfDownload);
        setProcessingStatus('Processing completed successfully!');
      } else {
        throw new Error(response.data.error || 'Failed to process image');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred while processing the image');
      setProcessingStatus('Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;

    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'coloring-page.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF');
    }
  };

  const resetApp = () => {
    setUploadedImage(null);
    setProcessedImage(null);
    setIsProcessing(false);
    setProcessingStatus('');
    setError(null);
    setDownloadUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            🎨 AI Coloring Page Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform any image into a beautiful black-and-white coloring page using AI
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upload Section */}
          <div className="card">
            <div className="flex items-center mb-6">
              <Upload className="w-6 h-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Upload Image</h2>
            </div>
            
            <ImageUploader 
              onImageUpload={handleImageUpload}
              isProcessing={isProcessing}
              fileInputRef={fileInputRef}
            />

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="card">
            <div className="flex items-center mb-6">
              <Image className="w-6 h-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Preview</h2>
            </div>

            <div className="space-y-6">
              {uploadedImage && (
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Original Image</h3>
                  <ImagePreview imageUrl={uploadedImage} alt="Original uploaded image" />
                </div>
              )}

              {processedImage && (
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Coloring Page</h3>
                  <ImagePreview imageUrl={processedImage} alt="AI-generated coloring page" />
                </div>
              )}

              {!uploadedImage && !processedImage && (
                <div className="text-center py-12 text-gray-500">
                  <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Upload an image to see the preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="card mb-8">
            <ProcessingStatus status={processingStatus} />
          </div>
        )}

        {/* Download Section */}
        {downloadUrl && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Ready to Download!</h3>
                  <p className="text-gray-600">Your AI-generated coloring page is ready as a PDF</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleDownload}
                  className="btn-secondary flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={resetApp}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Upload</h3>
            <p className="text-gray-600">Simply drag and drop or click to upload your PNG or JPEG images</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Processing</h3>
            <p className="text-gray-600">Advanced AI converts your images into perfect coloring book outlines</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Instant Download</h3>
            <p className="text-gray-600">Download your coloring page as a high-quality PDF ready to print</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 