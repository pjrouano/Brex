import { useParams } from "react-router-dom";
import React,{ useState,useEffect } from 'react';
import Papa from 'papaparse';
import '../../css/TakeQuiz.css'; // Import the CSS file for styling

function TakeQuiz() {
    const { id } = useParams();
    const [data,setData] = useState([]);
    const [currentIndex,setCurrentIndex] = useState(0);

    useEffect(() => {
        // Fetch and parse the specific CSV file based on the ID
        fetchUploadedFileById(id);
    },[id]);

    const fetchUploadedFileById = async (id) => {
        try {
            const filePath = `http://localhost:5000/uploads/Module ${id} Baseline Exam.csv`;
            const csvText = await fetch(filePath).then(response => response.text());
            Papa.parse(csvText,{
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    setData(results.data);
                }
            });
        } catch (error) {
            console.error('Error fetching the CSV file:',error);
        }
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
    };

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length);
    };

    return (
        <div className="quiz-container">
            <h1>Quiz for Module {id}</h1>
            {data.length > 0 ? (
                <div className="quiz-content">
                    <div className="question-section">
                        <h2>{data[currentIndex]['Question']}</h2>
                        {data[currentIndex]['Image'] && (
                            <div className="image-container">
                                <img src={data[currentIndex]['Image']} alt="Question related" />
                            </div>
                        )}
                    </div>
                    <div className="answers-section">
                        {Object.keys(data[currentIndex])
                            .filter(key => key.startsWith('Answer'))
                            .map((key,i) => (
                                <button key={i} className={`answer-button answer-${i + 1}`}>
                                    {data[currentIndex][key]}
                                </button>
                            ))}
                    </div>
                    <div className="explanation-section">
                        <h3>Correct Explanation</h3>
                        <p dangerouslySetInnerHTML={{ __html: data[currentIndex]['CorrectExplanation'] }}></p>
                        <h3>Incorrect Explanation</h3>
                        <p dangerouslySetInnerHTML={{ __html: data[currentIndex]['IncorrectExplanation'] }}></p>
                    </div>
                    <div className="navigation">
                        <button onClick={handlePrevious} disabled={currentIndex === 0}>Previous</button>
                        <button onClick={handleNext} disabled={currentIndex === data.length - 1}>Next</button>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default TakeQuiz;