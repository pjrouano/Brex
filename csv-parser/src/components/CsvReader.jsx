import React,{ useState,useEffect } from 'react';
import Papa from 'papaparse';

function CsvReader() {
    const [data,setData] = useState([]);
    const [currentIndex,setCurrentIndex] = useState(0);
    const [fileUploaded,setFileUploaded] = useState(false);

    useEffect(() => {
        fetch('http://localhost:5000/uploads/uploaded.csv')
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error('No uploaded CSV found');
                }
            })
            .then(csvText => {
                Papa.parse(csvText,{
                    header: true,
                    dynamicTyping: true,
                    complete: function (results) {
                        setData(results.data);
                        setFileUploaded(true);
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching the CSV file:',error);
            });
    },[]);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file',file);

            try {
                const response = await fetch('http://localhost:5000/upload',{
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();
                const filePath = result.filePath;
                setFileUploaded(true);

                fetch(`http://localhost:5000${filePath}`)
                    .then(response => response.text())
                    .then(csvText => {
                        Papa.parse(csvText,{
                            header: true,
                            dynamicTyping: true,
                            complete: function (results) {
                                setData(results.data);
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching the CSV file:',error);
                    });
            } catch (error) {
                console.error('Error uploading file:',error);
            }
        }
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
    };

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length);
    };

    return (
        <div>
            <h1>CSV Card Viewer</h1>
            {!fileUploaded && (
                <div>
                    <input type="file" accept=".csv" onChange={handleFileChange} />
                </div>
            )}
            {fileUploaded && data.length > 0 && (
                <div className="card-container">
                    <div className="card">
                        <div className="card-content">
                            <h2>{data[currentIndex]['Question']}</h2>
                            <p>{data[currentIndex]['Answer1']}</p>
                            <p>{data[currentIndex]['Answer2']}</p>
                            <p>{data[currentIndex]['Answer3']}</p>
                            <p>{data[currentIndex]['Answer4']}</p>
                            <p dangerouslySetInnerHTML={{ __html: data[currentIndex]['CorrectExplanation'] }}></p>
                            <p dangerouslySetInnerHTML={{ __html: data[currentIndex]['IncorrectExplanation'] }}></p>
                        </div>
                    </div>
                    <div className="navigation">
                        <button onClick={handlePrevious} disabled={currentIndex === 0}>Previous</button>
                        <button onClick={handleNext} disabled={currentIndex === data.length - 1}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CsvReader;
