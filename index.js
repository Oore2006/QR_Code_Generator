const inquirer = require("inquirer");
const express = require('express');
const bodyParser = require("body-parser");
const qr_code = require("qrcode")
const path = require("path")
const fs = require("fs");

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Ensure store Directory exists
const storePath = path.join(__dirname, "store");
if(!fs.existsSync(storePath)){
  fs.mkdirSync(storePath);
}

//Home route - render index page
app.get('/', function(req, res){
  res.render('index', {QR_code: '', img_src: ''});

});

// Generate QR Code route
app.post('/', function(req, res){
    const url = req.body.url;

    if(url){
      // Generate QR Code as Data URl
      qr_code.toDataURL(url, function(err, src){
        if(err){
          console.error(error);
          return res.send('Error generating QR Code');
        }

        // Generate unique filename
        const filename = `${Date.now()}.png`;
        const file_path = path.join(storePath, filename);

        // Save QR Code as file
        qr_code.toFile(file_path, url, {
          color: {
            dark: '#000', 
            light: '#0000'          
          }
        });

        // Render page with QR Code
        res.render('index', {
          QR_code: src,
          img_src: `/store/${filename}`
        });
      });
    } else{
      res.send('URL Not Set!');
    }

});

// Download route
app.get('/download', function(req, res){
  const file_path = path.join(__dirname, req.query.file_path);
  res.download(file_path);
});

// Serve static files from
app.use('/store', express.static(storePath));

// Start server
const PORT = 3000;
app.listen(PORT, function(){
    console.log(`Server listening on part ${PORT}`);

});



function generateQRCode(text) {
  console.log("Generating QR Code for:", text);
}

async function main() {
  try {
    const { text } = await inquirer.prompt([
      {
        type: "input",
        name: "text",
        message: "Enter text/URL for QR code generation:",
        validate: (input) => input.trim() !== "",
      },
    ]);

    generateQRCode(text);
  } catch (error) {
    console.error("QR code generation failed:", error);
  }
}

main();

async function generateQRCode(text, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: "H",
    width: 300,
    margin: 4,
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const filename = `${sanitizeFilename(text)}_qr.png`;
  const filepath = path.join(__dirname, "../qrcodes", filename);

  // Ensure qrcodes ditectory exists
  fs.mkdirSync(path.join(__dirname, "../qr_codes"), { recursive: true });

  try {
    QRCode.toFile(filepath, text, mergedOptions);
    console.log(`QR CCode generated: ${filename}`);
    return filepath;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

function sanitizeFilename(text) {
  return text
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()
    .substring(0, 50);
}
