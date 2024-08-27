// Example using Express.js
const express = require("express")
const multer = require("multer")
const cors = require("cors")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = process.env.PORT || 5000

// Ensure CORS is required and configured correctly
const corsOptions = {
	origin: 'https://brex-jet.vercel.app', // Allow only this origin to access
	optionsSuccessStatus: 200 // For legacy browser support
};

// Apply CORS middleware globally (recheck this placement)
app.use(cors(corsOptions));

app.use(express.json())

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Local storage for multer
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/')
	},
	filename: function (req, file, cb) {
		// Extract the module number from the original filename
		const match = file.originalname.match(/module-(\d+)-baseline-exam/);
		if (match) {
			const moduleNumber = match[1];
			const newFilename = `Module ${moduleNumber} Baseline Exam.csv`;
			cb(null, newFilename);
		} else {
			// Default filename if pattern does not match
			const defaultFilename = `UnknownFormat.csv`;
			cb(null, defaultFilename);
		}
	}
});

const uploadHandler = multer({ storage: storage });

// Update the upload endpoint with added error handling
app.post('/upload', cors(corsOptions), uploadHandler.single('file'), (req, res) => {
	if (!req.file) {
		return res.status(400).send('No file uploaded.');
	}
	res.send('File uploaded successfully.');
}).catch(err => {
	console.error("Upload error:", err);
	res.status(500).send("Internal Server Error");
});

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