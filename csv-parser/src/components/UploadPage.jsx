// src/UploadPage.jsx
import React from 'react';

function UploadPage() {
    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length) {
            const formData = new FormData();
            files.forEach(file => formData.append('files',file));

            try {
                const response = await fetch('http://localhost:10000/upload',{
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();
                console.log(result.filePaths); // Handle file paths as needed
            } catch (error) {
                console.error('Error uploading file:',error);
            }
        }
    };

    return (
        <div>
            <h1>Upload CSV Files</h1>
            <input type="file" accept=".csv" multiple onChange={handleFileChange} />
        </div>
    );
}

export default UploadPage;
