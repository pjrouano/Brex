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
		cb(null, "uploaded.csv") // Always save as 'uploaded.csv'
	},
})

const upload = multer({ storage })

// Endpoint to handle file upload
app.post("/upload", upload.single("file"), (req, res) => {
	console.log("File uploaded:", req.file) // Debug log
	res.json({ filePath: `/uploads/${req.file.filename}` })
})

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})
