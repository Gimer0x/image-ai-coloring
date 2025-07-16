const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const PDFDocument = require('pdfkit');
const sharp = require('sharp');
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

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use('/processed', express.static('processed'));

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
                text: "Analyze this image and describe what you see in detail. Focus on the main subjects, objects, shapes, and composition that would work well as a coloring book outline. Pay special attention to facial features, expressions, and important details that give character to the subject. Emphasize clear shapes, simple forms, and distinct outlines that children could easily color. Include specific details about eyes, nose, mouth, hair, and facial expressions. Avoid complex textures or detailed patterns that might be difficult to convert to simple line drawings."
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
        prompt: `Create a pure black and white line drawing outline for a children's coloring book based on this description: "${imageDescription}". 

CRITICAL REQUIREMENTS:
- Use ONLY solid black lines on pure white background
- NO grayscale, NO shading, NO shadows, NO gradients
- NO filled areas or black blocks - only outline lines
- Lines should be clean, bold, and continuous
- Background must be completely white (no gray areas)
- Style should be simple and child-friendly
- Avoid any areas filled with black color
- Create open spaces that children can color in

FACIAL DETAILS REQUIREMENTS:
- Include clear facial features: eyes, nose, mouth, eyebrows
- Draw simple but recognizable facial expressions
- Add basic hair outline and style
- Include ears if visible
- Keep facial features simple but expressive
- Ensure face has character and personality

The result should look exactly like a traditional coloring book page with clear, bold black outlines that children can easily color within, including all important facial details.`,
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
  return new Promise(async (resolve, reject) => {
    try {
      const pdfPath = path.join(__dirname, 'processed', `${imageId}-coloring-page.pdf`);
      
      // Ensure processed directory exists
      fs.ensureDirSync(path.dirname(pdfPath));
      
      // A4 dimensions in points (1 point = 1/72 inch)
      const A4_WIDTH = 595.28;
      const A4_HEIGHT = 841.89;
      
      // Margins
      const MARGIN = 40;
      const BOTTOM_MARGIN = 60; // Extra space for "by ColorMe" text
      
      // Calculate available space for image
      const availableWidth = A4_WIDTH - (MARGIN * 2);
      const availableHeight = A4_HEIGHT - MARGIN - BOTTOM_MARGIN;
      
      // Process and resize the image to fit A4
      const processedImageBuffer = await sharp(imagePath)
        .resize(Math.round(availableWidth), Math.round(availableHeight), {
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toBuffer();
      
      // Create PDF
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'portrait'
      });

      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      // Calculate image position to center it
      const imageInfo = await sharp(processedImageBuffer).metadata();
      const imageWidth = imageInfo.width;
      const imageHeight = imageInfo.height;
      
      const x = (A4_WIDTH - imageWidth) / 2;
      const y = MARGIN;

      // Add the processed image
      doc.image(processedImageBuffer, x, y, {
        width: imageWidth,
        height: imageHeight
      });

      // Add "by ColorMe" text at the bottom
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text('by ColorMe', {
           align: 'center',
           y: A4_HEIGHT - BOTTOM_MARGIN + 10
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
      console.error('Error generating PDF:', error);
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