// Example using Express.js
const express = require("express")
const multer = require("multer")
const cors = require("cors")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = process.env.PORT || 5000

// To allow specific origin
//app.use(cors({
//    origin: 'https://brex-jet.vercel.app'
//}));

// Or to allow all origins
app.use(cors());

app.use(express.json())

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Adjusted multer configuration
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadPath = path.join(__dirname, "uploads")
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath)
		}
		cb(null, uploadPath)
	},
	filename: (req, file, cb) => {
		// Detect and convert filename from "module-{number}-baseline-exam" to "Module {number} Baseline Exam.csv"
		const pattern = /module-(\d+)-baseline-exam/i;
		const match = file.originalname.match(pattern);
		if (match) {
			const moduleNumber = match[1]; // Extract the module number
			cb(null, `Module ${moduleNumber} Baseline Exam.csv`);
		} else {
			// Default filename if pattern does not match, ensuring it ends with .csv
			cb(null, file.originalname.endsWith('.csv') ? file.originalname : `${file.originalname}.csv`);
		}
	},
})

const upload = multer({ storage })

// Endpoint to handle file upload
app.post("/upload", upload.array("files", 10), (req, res) => {
	// Allow up to 10 files
	const filePaths = req.files.map((file) => `/uploads/${file.filename}`)
	res.json({ filePaths })
})

// Endpoint to delete a dataset
app.post("/delete-dataset", (req, res) => {
	const { filePath } = req.body
	const deleteFilePath = path.join(__dirname, filePath)
	fs.unlink(deleteFilePath, (err) => {
		if (err) {
			console.error("Error deleting dataset:", err)
			return res.status(500).json({ error: "Failed to delete dataset" })
		}
		res.status(200).json({ message: "Dataset deleted successfully" })
	})
})

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})

const generateIdFromFileName = (fileName) => {
	const match = fileName.match(/\d+/) // Extracts the first numeric part from the file name
	return match ? match[0] : fileName // If no numeric part is found, return the entire file name
}

// List uploaded files
app.get("/uploaded-files", (req, res) => {
	const uploadPath = path.join(__dirname, "uploads")
	fs.readdir(uploadPath, (err, files) => {
		if (err) {
			return res.status(500).json({ error: "Unable to list files" })
		}
		const filePaths = files.map((file) => ({
			id: generateIdFromFileName(file), // Generate unique ID based on file name
			name: path.parse(file).name,
		}))
		res.json(filePaths)
	})
})

// Define a root route handler
app.get('/', (req, res) => {
	res.status(200).send('Welcome to my API');
});

const storage_new = new Storage({
  projectId: 'crucial-module-415112',
  keyFilename: './csv-parser/crucial-module-415112-4f5effd08681.json'
});

const uploadHandler = multer({
  storage: new MulterGoogleCloudStorage({
    bucket: 'crucial-module-415112',
    projectId: 'crucial-module-415112',
    keyFilename: './csv-parser/crucial-module-415112-4f5effd08681.json',
    filename: (req, file, cb) => {
      // Optional. By default, it will save as original filename in the bucket
      const newFilename = `${Date.now()}_${file.originalname}`;
      cb(null, newFilename);
    }
  })
});

app.post('/upload', uploadHandler.single('file'), (req, res) => {
  res.send('File uploaded successfully.');
});