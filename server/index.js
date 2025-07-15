const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const PDFDocument = require('pdfkit');
const https = require('https');
const http = require('http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/processed', express.static('processed'));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PNG and JPEG files are allowed!'));
    }
  }
});

// Ensure directories exist
fs.ensureDirSync('uploads');
fs.ensureDirSync('processed');

// Routes
app.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const originalImagePath = req.file.path;
    const imageId = path.basename(req.file.filename, path.extname(req.file.filename));
    
    console.log(`Processing image: ${originalImagePath}`);

    // Process image with OpenAI
    const processedImagePath = await processImageWithAI(originalImagePath, imageId);
    
    // Generate PDF
    const pdfPath = await generatePDF(processedImagePath, imageId);

    res.json({
      success: true,
      originalImage: `/uploads/${req.file.filename}`,
      processedImage: `/processed/${imageId}-processed.png`,
      pdfDownload: `/download/${imageId}`,
      message: 'Image processed successfully!'
    });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ 
      error: 'Failed to process image',
      details: error.message 
    });
  }
});

app.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pdfPath = path.join(__dirname, 'processed', `${id}-coloring-page.pdf`);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    res.download(pdfPath, `coloring-page-${id}.pdf`);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ error: 'Failed to download PDF' });
  }
});

// AI Image Processing Function
async function processImageWithAI(imagePath, imageId) {
  try {
    console.log('Starting AI image processing...');
    
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // First, use GPT-4 Vision to analyze the uploaded image
    const visionResponse = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image and describe what you see in detail. Focus on the main subjects, objects, shapes, and composition. This description will be used to create a coloring book outline."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Vision analysis timed out after 30 seconds')), 30000)
      )
    ]);

    const imageDescription = visionResponse.choices[0].message.content;
    console.log('Image analysis:', imageDescription);

    // Now generate a coloring book version based on the analysis
    const generationResponse = await Promise.race([
      openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a black and white line drawing outline for a children's coloring book based on this description: "${imageDescription}". The result should be a simple, clean outline with bold black lines on a pure white background. No colors, no shading, no grayscale - just clear black outlines that a child could color in. Make it look exactly like a traditional coloring book page with clean, simple shapes.`,
        n: 1,
        size: "1024x1024",
        response_format: "url"
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Image generation timed out after 60 seconds')), 60000)
      )
    ]);

    if (!generationResponse.data || !generationResponse.data[0] || !generationResponse.data[0].url) {
      throw new Error('No response from OpenAI image generation API');
    }

    // Download the processed image from OpenAI
    const processedImageUrl = generationResponse.data[0].url;
    const processedImagePath = path.join(__dirname, 'processed', `${imageId}-processed.png`);
    
    // Download the AI-generated image using Node.js native HTTP
    const downloadedImageBuffer = await downloadImage(processedImageUrl);
    fs.writeFileSync(processedImagePath, downloadedImageBuffer);
    
    console.log('AI processing completed successfully');
    console.log('Processed image saved to:', processedImagePath);
    
    return processedImagePath;
    
  } catch (error) {
    console.error('Error in AI processing:', error);
    throw error;
  }
}

// Note: Removed createWhiteMask function as it's no longer needed

// Download image from URL using Node.js native HTTP
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', (error) => reject(error));
    }).on('error', (error) => reject(error));
  });
}

// Generate PDF from processed image
async function generatePDF(imagePath, imageId) {
  return new Promise((resolve, reject) => {
    try {
      const pdfPath = path.join(__dirname, 'processed', `${imageId}-coloring-page.pdf`);
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'portrait'
      });

      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      // Add title
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('AI Generated Coloring Page', {
           align: 'center',
           y: 50
         });

      // Add subtitle
      doc.fontSize(14)
         .font('Helvetica')
         .text('Perfect for kids and adults alike!', {
           align: 'center',
           y: 80
         });

      // Add the image (centered)
      // Note: In a real implementation, you'd load the actual processed image
      // For now, we'll create a placeholder
      doc.rect(50, 120, 495, 600)
         .stroke()
         .fontSize(16)
         .text('Your AI-generated coloring page will appear here', {
           align: 'center',
           y: 400
         });

      // Add footer
      doc.fontSize(10)
         .text('Generated by AI Coloring Page Generator', {
           align: 'center',
           y: 750
         });

      doc.end();

      writeStream.on('finish', () => {
        console.log(`PDF generated: ${pdfPath}`);
        resolve(pdfPath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Coloring Page Generator is running!' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`📁 Processed directory: ${path.join(__dirname, 'processed')}`);
}); 