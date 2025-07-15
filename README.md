# 🎨 AI Coloring Page Generator

A full-stack web application that transforms any image into a beautiful black-and-white coloring page using AI. Upload your images and get instant coloring book pages perfect for kids and adults alike!

## ✨ Features

- **🎯 Easy Image Upload**: Drag-and-drop or click to upload PNG/JPEG images
- **🤖 AI-Powered Processing**: Uses OpenAI's advanced image processing to create perfect outlines
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **📄 PDF Export**: Download your coloring pages as high-quality PDFs
- **🔍 Image Preview**: Zoom, rotate, and preview both original and processed images
- **⚡ Real-time Processing**: Live status updates during image processing

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **OpenAI API** - AI image processing
- **Multer** - File upload handling
- **PDFKit** - PDF generation
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-coloring-page-generator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cd server
   cp env.example .env
   ```
   
   Edit `server/.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

5. **Open your browser**
   Navigate to `http://localhost:3000` to use the application.

## 📖 Usage

1. **Upload an Image**
   - Drag and drop an image file onto the upload area
   - Or click to browse and select a file
   - Supported formats: PNG, JPEG (max 10MB)

2. **Wait for Processing**
   - The AI will automatically process your image
   - You'll see real-time status updates
   - Processing typically takes 10-30 seconds

3. **Preview Results**
   - View both the original and processed images
   - Use zoom and rotate controls to examine details
   - The processed image will be a clean black-and-white outline

4. **Download PDF**
   - Click the "Download PDF" button
   - Your coloring page will be saved as a high-quality PDF
   - Perfect for printing and coloring!

## 🎯 Tips for Best Results

- **Use high-quality images** with clear subjects
- **Simple backgrounds** work best for clean outlines
- **Good contrast** between subject and background
- **Avoid complex patterns** that might confuse the AI
- **Test with different images** to see what works best

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Backend server port | No (default: 5000) |
| `NODE_ENV` | Environment mode | No (default: development) |

### API Endpoints

- `POST /upload-image` - Upload and process an image
- `GET /download/:id` - Download the generated PDF
- `GET /health` - Health check endpoint

## 🏗️ Project Structure

```
ai-coloring-page-generator/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind configuration
├── server/                # Node.js backend
│   ├── uploads/           # Uploaded images (auto-created)
│   ├── processed/         # Processed images (auto-created)
│   ├── index.js           # Main server file
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment variables example
├── package.json           # Root package.json
└── README.md             # This file
```

## 🚀 Deployment

### Frontend (React)
The React app can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Backend (Node.js)
The Express server can be deployed to:
- Heroku
- DigitalOcean
- AWS EC2
- Railway
- Render

### Environment Setup for Production
1. Set `NODE_ENV=production`
2. Configure CORS for your domain
3. Set up proper file storage (AWS S3 recommended)
4. Configure rate limiting and security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI image processing capabilities
- The React and Node.js communities for excellent documentation
- Tailwind CSS for the beautiful styling framework

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

---

**Happy Coloring! 🎨✨** 