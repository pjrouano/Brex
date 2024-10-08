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

    const handleDeleteDataSet = async (index) => {
        const dataSetToDelete = dataSets[index];
        try {
            // Delete dataset from server
            const response = await fetch(`http://localhost:5000/delete-dataset`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filePath: dataSetToDelete.filePath }),
            });

            if (response.ok) {
                // Remove dataset from state
                const updatedDataSets = [...dataSets];
                updatedDataSets.splice(index,1);
                setDataSets(updatedDataSets);
                // Reset current index if needed
                if (index === currentDataIndex) {
                    setCurrentDataIndex(0);
                    setCurrentIndex(0);
                } else if (index < currentDataIndex) {
                    setCurrentDataIndex(currentDataIndex - 1);
                    setCurrentIndex(0);
                }
                console.log('Dataset deleted successfully');
            } else {
                console.error('Failed to delete dataset');
            }
        } catch (error) {
            console.error('Error deleting dataset:',error);
        }
    };

    return (
        <div>
            <h1>CSV Card Viewer</h1>
            {dataSets.length > 0 && (
                <div>
                    <div className="data-set-selector">
                        {dataSets.map((dataSet,index) => (
                            <div key={index}>
                                <button onClick={() => handleDataSetChange(index)}>
                                    {`DataSet ${index + 1}`}
                                </button>
                                <button onClick={() => handleDeleteDataSet(index)}>Delete</button>
                            </div>
                        ))}
                    </div>
                    <div className="card-container">
                        <div className="card">
                            <div className="card-content">
                                <h2>{dataSets[currentDataIndex].data[currentIndex]['Question']}</h2>
                                {Object.keys(dataSets[currentDataIndex].data[currentIndex])
                                    .filter(key => key.startsWith('Answer'))
                                    .map((key,i) => (
                                        <p key={i}>{dataSets[currentDataIndex].data[currentIndex][key]}</p>
                                    ))}
                                <h3>Correct Explanation</h3>
                                <p dangerouslySetInnerHTML={{ __html: dataSets[currentDataIndex].data[currentIndex]['CorrectExplanation'] }}></p>
                                <h3>Incorrect Explanation</h3>
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
