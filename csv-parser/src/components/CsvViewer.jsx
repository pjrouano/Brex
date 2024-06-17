import React,{ useState,useEffect } from 'react';
import Papa from 'papaparse';

function CsvViewer() {
    const [dataSets,setDataSets] = useState([]);
    const [currentDataIndex,setCurrentDataIndex] = useState(0);
    const [currentIndex,setCurrentIndex] = useState(0);

    useEffect(() => {
        // Fetch and parse CSV files from the server
        fetchUploadedFiles();
    },[]);

    const fetchUploadedFiles = async () => {
        try {
            const filePaths = await fetch('http://localhost:5000/uploaded-files').then(res => res.json());
            const dataPromises = filePaths.map(filePath =>
                fetch(`http://localhost:5000${filePath}`)
                    .then(response => response.text())
                    .then(csvText => {
                        return new Promise((resolve) => {
                            Papa.parse(csvText,{
                                header: true,
                                dynamicTyping: true,
                                complete: function (results) {
                                    resolve({ filePath,data: results.data });
                                }
                            });
                        });
                    })
            );

            const parsedDataSets = await Promise.all(dataPromises);
            setDataSets(parsedDataSets);
        } catch (error) {
            console.error('Error fetching the CSV files:',error);
        }
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % dataSets[currentDataIndex].data.length);
    };

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + dataSets[currentDataIndex].data.length) % dataSets[currentDataIndex].data.length);
    };

    const handleDataSetChange = (index) => {
        setCurrentDataIndex(index);
        setCurrentIndex(0);
    };

    return (
        <div>
            <h1>CSV Card Viewer</h1>
            {dataSets.length > 0 && (
                <div>
                    <div className="data-set-selector">
                        {dataSets.map((dataSet,index) => (
                            <button key={index} onClick={() => handleDataSetChange(index)}>
                                {`DataSet ${index + 1}`}
                            </button>
                        ))}
                    </div>
                    <div className="card-container">
                        <div className="card">
                            <div className="card-content">
                                <h2>{dataSets[currentDataIndex].data[currentIndex]['Question']}</h2>
                                <p>{dataSets[currentDataIndex].data[currentIndex]['Answer1']}</p>
                                <p>{dataSets[currentDataIndex].data[currentIndex]['Answer2']}</p>
                                <p>{dataSets[currentDataIndex].data[currentIndex]['Answer3']}</p>
                                <p>{dataSets[currentDataIndex].data[currentIndex]['Answer4']}</p>
                                <p dangerouslySetInnerHTML={{ __html: dataSets[currentDataIndex].data[currentIndex]['CorrectExplanation'] }}></p>
                                <p dangerouslySetInnerHTML={{ __html: dataSets[currentDataIndex].data[currentIndex]['IncorrectExplanation'] }}></p>
                            </div>
                        </div>
                        <div className="navigation">
                            <button onClick={handlePrevious} disabled={currentIndex === 0}>Previous</button>
                            <button onClick={handleNext} disabled={currentIndex === dataSets[currentDataIndex].data.length - 1}>Next</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CsvViewer;
