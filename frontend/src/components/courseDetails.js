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
  },container: {
    backgroundColor: "#F7F7F7",
    border: "1px solid #BFBFBF",
    boxShadow:
      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",

    margin: 20,
    padding: 5,
    width: "95%"
  },

});

const CourseDetails = () => {

  const classes = useStyles();
  const [queryParameters] = useSearchParams();
  const c_id = queryParameters.get("id");


  const [course, setCourse] = useState([]);
  const [my_rec, setRec] = useState([]);

  const { sendRequest } = useHttpClient();
  async function handleClick() {
    console.log("Button clicked");
    try {
      const [responseData, statusOk] = await sendRequest(
        `/db?id=${c_id}`,
        "GET",
        null,
        {
          "Content-Type": "application/json",
        }
      );
      console.log(responseData);
      if (statusOk) {
        setCourse(responseData.res);
        setRec(responseData.rec);
        
      }
    } catch (err) {}
  }
  useEffect(() => {
    handleClick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div >
              <CourseHeader/>
              <Container sx={{ maxWidth:'95%'  }} maxWidth={false} className={classes.container}>
        <Paper className={classes.root} elevation={1}>
        <Typography variant="h4" component="h3">
        {course.title}
        </Typography>
        <Typography variant="h6" component="p">
        Lehrende: {course.teacher}
        </Typography>
        <Typography  component="span">
        SWS: {course.sws} 
        </Typography>
        
        <Typography className={classes.ects} component="span">
        ECTS-Credits: {course.credits}
        </Typography>
        <Typography className={classes.ects} component="span">
        Turnus: {course.rotation}
        </Typography>
        <Typography className={classes.ects} component="span">
        Sprache: {course.language}
        </Typography>
      </Paper>

    <Accordion  defaultExpanded>
        < AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>Lernziele</Typography>
        </ AccordionSummary>
        <AccordionDetails >
          <Typography>
          {course.goals}
          </Typography>
        </AccordionDetails >
      </Accordion >
      <Accordion  defaultExpanded>
        < AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>Beschreibung</Typography>
        </ AccordionSummary>
        <AccordionDetails >
          <Typography>
          {course.description}
          </Typography>
        </AccordionDetails >
      </Accordion >
      </Container>
      <Container sx={{ maxWidth:'95%'  }} maxWidth={false} className={classes.container}>
      <Typography variant={"h5"} component={"h2"}>
      Ähnliche Veranstaltungen ({my_rec.length})
        </Typography>
        <Typography component="div">
          <ResultList results={my_rec} />
        </Typography>
      </Container>
      </div>
  );
};

export default CourseDetails;
