import React, { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import Accordion  from '@mui/material/Accordion';
import  AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails  from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useHttpClient } from "../hooks/useHttp"; 
import Paper from '@mui/material/Paper';
import CourseHeader from "./courseHeader";
import Container from "@mui/material/Container";
import ResultList from "./ResultList";
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import Enroll from './enroll'
import Chip from '@mui/material-next/Chip';

import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
  }));
const useStyles = makeStyles({
  root: {
    padding: 10,
    //maxWidth: 865,
  },
  media: {
    height: 300,
  },
  ects:{
    paddingLeft: 20,
  },
  container: {
    backgroundColor: "#F7F7F7",
    border: "1px solid #BFBFBF",
    boxShadow:
      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",

    margin: 20,
    padding: 5,
    minWidth: "95%"
  },
  btn:{
    float: "right"
  }

});

const CourseDetails = () => {
  const [keywords, setKeywords] = useState(["1"]);
  const classes = useStyles();
  const [queryParameters] = useSearchParams();
  const c_id = queryParameters.get("id");
  const token = sessionStorage.getItem('token');

  const [rating1, setRating1] = useState(0);
  const [rating2, setRating2] = useState(0);
  const [rating3, setRating3] = useState(0);
  const [count, setCount] = useState(0);
  const [enrolled, setEnrolled] = useState(false);

  const [course, setCourse] = useState([]);
  const [my_rec, setRec] = useState([]);
  const [together, setTogether] = useState([]);

  const { sendRequest } = useHttpClient();
  async function handleClick() {
    try {
      const [responseData, statusOk] = await sendRequest(
        `/db?id=${c_id}&uid=${token}`,
        "GET",
        null,
        {
          "Content-Type": "application/json",
        }
      );
      console.log(responseData);
      if (statusOk) {
        setCourse(responseData.res);
        setKeywords(responseData.res.keywords);
        setRec(responseData.rec);
        setCount(responseData.ratings.count);
        setRating1(responseData.ratings.count>0?responseData.ratings.r1/responseData.ratings.count:0);
        setRating2(responseData.ratings.count>0?responseData.ratings.r2/responseData.ratings.count:0);
        setRating3(responseData.ratings.count>0?responseData.ratings.r3/responseData.ratings.count:0);
        setEnrolled(!responseData.enrolled);
        setTogether(responseData.together);
        console.log(keywords);
        
      }
    } catch (err) {}
  }
  useEffect(() => {
    handleClick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className={classes.details} style={{display: "grid"}}>
      <CourseHeader/>
        <Container sx={{ maxWidth:'95%'  }} maxWidth={false} className={classes.container}>
        <Paper className={classes.root} elevation={2}>
        <Typography variant="h4" component="h3">
        {course.title} <Enroll enrolled ={enrolled}/>
        </Typography>
        <Typography variant="h6" component="p">
        Teacher: {course.teacher}
        </Typography>
        <Typography  component="span">
        SWS: {course.sws} 
        </Typography>
        
        <Typography className={classes.ects} component="span">
        ECTS-Credits: {course.credits}
        </Typography>
        <Typography className={classes.ects} component="span">
        Semester: {course.rotation}
        </Typography>
        <Typography className={classes.ects} component="span">
        Language: {course.language}
        </Typography>
        <br></br>
        
      </Paper>
      <Paper>
      
      </Paper>
      <Accordion  >
        < AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography component="span"> <Rating 
        name="text-feedback0"
        value={(rating1+rating2+rating3)/3}
        readOnly
        precision={0.1}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
      />({count})</Typography>
        </ AccordionSummary>
        <AccordionDetails >
        <Typography component="legend"><Rating
        name="text-feedback1"
        value={rating1}
        readOnly
        precision={0.5}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
      /> How happy were you with the course? </Typography>
      <Typography component="legend"><Rating
        name="text-feedback2"
        value={rating2}
        readOnly
        precision={0.5}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
      /> How helpful was the course? </Typography>
      <Typography component="legend"><Rating
        name="text-feedback3"
        value={rating3}
        readOnly
        precision={0.5}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
      /> How easy was the course?</Typography>
        </AccordionDetails >
        </Accordion >

    <Accordion  >
        < AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>Goals</Typography>
        </ AccordionSummary>
        <AccordionDetails >
          <Typography>
          {course.goals}
          </Typography>
        </AccordionDetails >
      </Accordion >

      <Accordion  >
        < AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>Description</Typography>
        </ AccordionSummary>
        <AccordionDetails >
          <Typography>
          {course.description}
          </Typography>
        </AccordionDetails >
      </Accordion >
      <Accordion  >
        < AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>Keywords</Typography>
        </ AccordionSummary>
        <AccordionDetails >
          <Typography
        sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            listStyle: 'none',
            p: 0.5,
            m: 0,
        }}
        component="ul"
        >
        {keywords.map((item, i) => (
          <ListItem key={i}>
              <Chip
                label={item}
                color="info"
            />
          </ListItem>
            ))}
          
          </Typography>
        </AccordionDetails >
      </Accordion >


      </Container>
      <Container sx={{ maxWidth:'95%'  }} maxWidth={false} className={classes.container}>
      <Typography variant={"h5"} component={"h2"}>
      Similar courses ({my_rec.length})
        </Typography>
        <Typography component="div">
          <ResultList results={my_rec} />
        </Typography>
      </Container>
      <Container sx={{ maxWidth:'95%'  }} maxWidth={false} className={classes.container}>
      <Typography variant={"h5"} component={"h2"}>
      Usually together ({together.length})
        </Typography>
        <Typography component="div">
          <ResultList results={together} />
        </Typography>
      </Container>
      </div>
  );
};

export default CourseDetails;
