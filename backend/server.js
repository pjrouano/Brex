const express = require("express")
const multer = require("multer")
const cors = require("cors")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Set up storage engine for multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadPath = path.join(__dirname, "uploads")
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath)
		}
		cb(null, uploadPath)
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`)
	},
})

const upload = multer({ storage })

// Endpoint to handle file upload
app.post("/upload", upload.array("files", 10), (req, res) => {
	// Allow up to 10 files
	const filePaths = req.files.map((file) => `/uploads/${file.filename}`)
	res.json({ filePaths })
})

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})

// List uploaded files
app.get("/uploaded-files", (req, res) => {
	const uploadPath = path.join(__dirname, "uploads")
	fs.readdir(uploadPath, (err, files) => {
		if (err) {
			return res.status(500).json({ error: "Unable to list files" })
		}
		const filePaths = files.map((file) => `/uploads/${file}`)
		res.json(filePaths)
	})
})
