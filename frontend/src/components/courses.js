import React, { useState, useEffect } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import { makeStyles } from "@mui/styles";

import ResultList from "./ResultList";
import CourseHeader from "./courseHeader";
import { useHttpClient } from "../hooks/useHttp"; 

const useStyles = makeStyles({
  container: {
    backgroundColor: "#F7F7F7",
    border: "1px solid #BFBFBF",
    boxShadow:
      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",

    margin: 20,
    padding: 5,
    width: "95%"
  },
});


export default function Courses()  {
  let study = sessionStorage.getItem('study');

  const classes = useStyles();
  const [results, setResults] = useState([]);
  const { sendRequest } = useHttpClient();
  async function handleClick() {
    console.log("Button clicked");
    try {
      const [responseData, statusOk] = await sendRequest(
        `/test?s=${study}`,
        "GET",
        null,
        {
          "Content-Type": "application/json",
        }
      );
      console.log(responseData);
      if (statusOk) {
        setResults(responseData.res);
      }
    } catch (err) {}
  }
  useEffect(() => {
      handleClick();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <CourseHeader/>
      <Container sx={{ maxWidth:'95%'  }} maxWidth={false} className={classes.container}>
      <Typography variant={"h5"} component={"h2"}>
          Vorlesungen ({results.length})
        </Typography>
        <Typography component="div">
          <ResultList results={results} />
        </Typography>
      </Container>
      <div
        style={{
          position: "fixed",
          bottom: 10,
          right: 10,
        }}
      >
      </div>
    </React.Fragment>
  );
}

