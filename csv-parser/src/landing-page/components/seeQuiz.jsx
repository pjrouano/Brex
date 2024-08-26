import React,{ useEffect,useState } from 'react';
import axios from 'axios';
import { Grid,Card,CardContent,Typography,CardActions,Button,CardActionArea } from '@mui/material';
import Stack from '@mui/material/Stack';
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const seeQuiz = () => {
    const [quizzes,setQuizzes] = useState([]);
    const navigate = useNavigate();

    const Img = styled("img")({
        margin: "auto",
        display: "block",
        maxWidth: "100%",
        maxHeight: "100%",
    });

    function handleTakeQuiz(id) {
        navigate(`/Assessment/${id}`)
    }

    useEffect(() => {
        // Fetch the list of uploaded quizzes from the backend
        axios.get('http://localhost:5000/uploaded-files')
            .then(response => {
                setQuizzes(response.data);
                console.log(quizzes)
            })
            .catch(error => {
                console.error('There was an error fetching the quiz data!',error);
            });
    },[]);

    return (
        <Grid container justifyContent="center" alignItems="center" style={{ marginTop: '5rem' }}>
            {quizzes.map((quiz,index) => (
                <Grid item key={index} style={{ margin: '1rem' }}>
                    <Card sx={{ maxWidth: 345 }}>
                        <CardActionArea onClick={() => handleTakeQuiz(quiz.id)}>
                            <Grid item xs={12} sx={{ display: 'flex',justifyContent: 'center' }}>
                                <Stack sx={{ width: 150,height: 150 }}>
                                    <Img alt={quiz.name} src={'logo.png'} />
                                </Stack>
                            </Grid>
                        </CardActionArea>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                {quiz.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {' You can add more quiz description here if available '}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default seeQuiz;