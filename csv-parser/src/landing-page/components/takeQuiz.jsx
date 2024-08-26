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
    const [selectedAnswers, setSelectedAnswers] = useState({}); // Change to store selected answers for each question
    const [correctAnswers,setCorrectAnswers] = useState(0);
    const [wrongAnswers,setWrongAnswers] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [showConfirmFinish, setShowConfirmFinish] = useState(false); // New state for showing confirmation
    const [answeredQuestions, setAnsweredQuestions] = useState(new Set()); // Tracks indices of answered questions
    const [showNavigation, setShowNavigation] = useState(false); // Add a new state for toggling the navigation visibility

    useEffect(() => {
        // Load saved state from localStorage when the component mounts
        const savedAnswers = JSON.parse(localStorage.getItem('selectedAnswers'));
        const savedCorrectAnswers = JSON.parse(localStorage.getItem('correctAnswers'));
        const savedWrongAnswers = JSON.parse(localStorage.getItem('wrongAnswers'));
        const savedAnsweredQuestions = new Set(JSON.parse(localStorage.getItem('answeredQuestions')));

        if (savedAnswers) setSelectedAnswers(savedAnswers);
        if (savedCorrectAnswers !== null) setCorrectAnswers(savedCorrectAnswers);
        if (savedWrongAnswers !== null) setWrongAnswers(savedWrongAnswers);
        if (savedAnsweredQuestions) setAnsweredQuestions(savedAnsweredQuestions);

        fetchUploadedFileById(id);
    }, [id]);

    useEffect(() => {
        if (isFinished) {
            localStorage.removeItem('selectedAnswers');
            localStorage.removeItem('correctAnswers');
            localStorage.removeItem('wrongAnswers');
            localStorage.removeItem('answeredQuestions');
        }
    }, [isFinished]);

    const fetchUploadedFileById = async (id) => {
        try {
            const filePath = `http://localhost:5000/uploads/Module ${id} Baseline Exam.csv`;
            const csvText = await fetch(filePath).then(response => response.text());
            Papa.parse(csvText, {
                header: true, // Ensures the first row is treated as headers
                dynamicTyping: true,
                skipEmptyLines: true, // Skips empty lines to avoid counting them as data
                complete: function (results) {
                    setData(results.data);
                }
            });
        } catch (error) {
            console.error('Error fetching the CSV file:',error);
        }
    };

    const handleAnswerClick = (answer,answerIndex) => {
        if (isFinished || answeredQuestions.has(currentIndex)) return; // Prevent interaction if finished or already answered

        const newSelectedAnswers = { ...selectedAnswers, [currentIndex]: answer };
        setSelectedAnswers(newSelectedAnswers);
        localStorage.setItem('selectedAnswers', JSON.stringify(newSelectedAnswers));

        const newAnsweredQuestions = new Set(answeredQuestions).add(currentIndex);
        setAnsweredQuestions(newAnsweredQuestions);
        localStorage.setItem('answeredQuestions', JSON.stringify([...newAnsweredQuestions]));

        if (answerIndex === data[currentIndex]['CorrectAns']) {
            const newCorrectAnswers = correctAnswers + 1;
            setCorrectAnswers(newCorrectAnswers);
            localStorage.setItem('correctAnswers', JSON.stringify(newCorrectAnswers));
        } else {
            const newWrongAnswers = wrongAnswers + 1;
            setWrongAnswers(newWrongAnswers);
            localStorage.setItem('wrongAnswers', JSON.stringify(newWrongAnswers));
        }
    };

    const handleNext = () => {
        setSelectedAnswers(prev => ({ ...prev, [currentIndex]: null })); // Reset selected answer for current index
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
    };

    const handlePrevious = () => {
        setSelectedAnswers(prev => ({ ...prev, [currentIndex]: null })); // Reset selected answer for current index
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
                                const isSelected = selectedAnswers[currentIndex] === data[currentIndex][key];
                                const isCorrect = i + 1 === data[currentIndex]['CorrectAns'];
                                let buttonClass = `answer-button answer-${i + 1}`;
                                if (answeredQuestions.has(currentIndex)) { // Check if the question has been answered
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
                                        disabled={answeredQuestions.has(currentIndex)} // Disable if answered
                                    >
                                        {data[currentIndex][key]}
                                        {isSelected && answeredQuestions.has(currentIndex) && (isCorrect ? ' ✔️' : <span className="wrong-symbol"><FontAwesomeIcon icon={faTimes} /></span>)}
                                    </button>
                                );
                            })}
                    </div>
                    {answeredQuestions.has(currentIndex) && selectedAnswers[currentIndex] && (
                        <div className="explanation-section">
                            <h3>Explanation</h3>
                            {containsImgTag(data[currentIndex]['CorrectExplanation']) ? (
                                <div className="explanation-image-container" dangerouslySetInnerHTML={{ __html: data[currentIndex]['CorrectExplanation'] }}></div>
                            ) : (
                                <p dangerouslySetInnerHTML={{ __html: data[currentIndex]['CorrectExplanation'] }}></p>
                            )}
                        </div>
                    )}
                    {/* Button to toggle navigation visibility, placed above the navigation section and centered */}
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <button onClick={() => setShowNavigation(!showNavigation)}>
                            {showNavigation ? 'Hide Navigation' : 'Show Navigation'}
                        </button>
                    </div>
                    <div className="quiz-navigation">
                        {showNavigation && data.map((item, index) => {
                            const isAnswered = answeredQuestions.has(index);
                            // Assuming CorrectAns stores the index of the correct answer starting from 1, and the answers are stored like Answer1, Answer2, etc.
                            const correctAnswerIndex = item['CorrectAns'];
                            const selectedAnswerText = selectedAnswers[index];
                            const isCorrect = item[`Answer${correctAnswerIndex}`] === selectedAnswerText;
                            let navButtonClass = `nav-button ${index === currentIndex ? 'current' : ''} ${isAnswered ? (isCorrect ? 'correct' : 'wrong') : ''}`;
                            return (
                                <button
                                    key={index}
                                    className={navButtonClass}
                                    onClick={() => setCurrentIndex(index)}
                                >
                                    {item.Image ? 'i' : index + 1}
                                </button>
                            );
                        })}
                    </div>
                    <div className="navigation">
                        <button onClick={handlePrevious} disabled={currentIndex === 0 || isFinished}>Previous</button>
                        <button onClick={handleNext} disabled={currentIndex === data.length - 1 || isFinished}>Next</button>
                        {!isFinished && (
                            <>
                                {showConfirmFinish ? (
                                    <>
                                        <button onClick={() => setIsFinished(true)}>Confirm Finish</button>
                                        <button onClick={() => setShowConfirmFinish(false)}>Cancel</button>
                                    </>
                                ) : (
                                    <button onClick={() => setShowConfirmFinish(true)}>Finish</button>
                                )}
                            </>
                        )}
                    </div>
                    {isFinished && (
                        <div className="score-section">
                            <p>Correct Answers: {correctAnswers}</p>
                            <p>Wrong Answers: {wrongAnswers}</p>
                        </div>
                    )}
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default TakeQuiz;