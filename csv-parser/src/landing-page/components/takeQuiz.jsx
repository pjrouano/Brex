import { useParams } from "react-router-dom";
import React,{ useState,useEffect } from 'react';
import Papa from 'papaparse';
import '../../css/TakeQuiz.css'; // Import the CSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons'; // Import the specific icon

function TakeQuiz() {
    const { id } = useParams();
    const [data,setData] = useState([]);
    const [currentIndex,setCurrentIndex] = useState(0);
    const [selectedAnswer,setSelectedAnswer] = useState(null);
    const [correctAnswers,setCorrectAnswers] = useState(0);
    const [wrongAnswers,setWrongAnswers] = useState(0);

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

    const handleAnswerClick = (answer,answerIndex) => {
        setSelectedAnswer(answer);
        if (answerIndex === data[currentIndex]['CorrectAns']) {
            setCorrectAnswers(correctAnswers + 1);
        } else {
            setWrongAnswers(wrongAnswers + 1);
        }
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
    };

    const handlePrevious = () => {
        setSelectedAnswer(null);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length);
    };

    const containsImgTag = (htmlString) => {
        const imgTagRegex = /<img\s+[^>]*src="[^"]*"[^>]*>/i;
        return imgTagRegex.test(htmlString);
    };

    return (
        <div className="quiz-container">
            {data.length > 0 && data[currentIndex] ? (
                <div className="quiz-card">
                    <div className="progress-bar">
                        <div className="progress" style={{ width: `${((currentIndex + 1) / data.length) * 100}%` }}></div>
                    </div>
                    <div className="question-section">
                        <div className="question-number">
                            {`${currentIndex + 1}/${data.length}`}
                        </div>
                        <h2>{data[currentIndex]['Question']}</h2>
                        {data[currentIndex]['Image'] && (
                            <div className="image-container">
                                <img src={data[currentIndex]['Image']} alt="Question related" />
                            </div>
                        )}
                    </div>
                    <div className="answers-section">
                        {Object.keys(data[currentIndex])
                            .filter(key => key.startsWith('Answer') && data[currentIndex][key])
                            .map((key,i) => {
                                const isSelected = selectedAnswer === data[currentIndex][key];
                                const isCorrect = i + 1 === data[currentIndex]['CorrectAns'];
                                let buttonClass = `answer-button answer-${i + 1}`;
                                if (selectedAnswer !== null) {
                                    if (isSelected) {
                                        buttonClass += isCorrect ? ' correct' : ' wrong';
                                    } else if (isCorrect) {
                                        buttonClass += ' correct';
                                    } else {
                                        buttonClass += ' not-chosen';
                                    }
                                }
                                return (
                                    <button
                                        key={i}
                                        className={buttonClass}
                                        onClick={() => handleAnswerClick(data[currentIndex][key],i + 1)}
                                        disabled={selectedAnswer !== null}
                                    >
                                        {data[currentIndex][key]}
                                        {isSelected && (isCorrect ? ' ✔️' : <span className="wrong-symbol"><FontAwesomeIcon icon={faTimes} /></span>)}
                                    </button>
                                );
                            })}
                    </div>
                    {selectedAnswer && (
                        <div className="explanation-section">
                            <h3>Explanation</h3>
                            {containsImgTag(data[currentIndex]['CorrectExplanation']) ? (
                                <div className="explanation-image-container" dangerouslySetInnerHTML={{ __html: data[currentIndex]['CorrectExplanation'] }}></div>
                            ) : (
                                <p dangerouslySetInnerHTML={{ __html: data[currentIndex]['CorrectExplanation'] }}></p>
                            )}
                        </div>
                    )}
                    <div className="navigation">
                        <button onClick={handlePrevious} disabled={currentIndex === 0}>Previous</button>
                        <button onClick={handleNext} disabled={currentIndex === data.length - 1}>Next</button>
                    </div>
                    <div className="score-section">
                        <p>Correct Answers: {correctAnswers}</p>
                        <p>Wrong Answers: {wrongAnswers}</p>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default TakeQuiz;