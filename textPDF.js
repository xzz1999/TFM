const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdf = require("pdf-parse");

const app = express();
const port = 3001;

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/text/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("File not received");
    }

    const pdfBuffer = req.file.buffer;
    const pdfText = await extractTextFromPDF(pdfBuffer);
  

    res.json({sucess: true, text: pdfText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during text extraction.' });
  }
});

const extractTextFromPDF = (pdfBuffer) => {
  return new Promise((resolve, reject) => {
    pdf(pdfBuffer).then(function(data) {
      resolve(data.text);
    }).catch(function(error) {
      reject(error);
    });
  });
};

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
