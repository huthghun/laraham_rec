import React from "react";

import { makeStyles } from "@mui/styles";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

import ResultItem from "./ResultItem";
const useStyles = makeStyles({
  root: {
    minWidth: 275,
    margin: 10,
  },
  title: {
    fontSize: 14,
  },
  container: {
    marginTop: 30,
  },
});

const ResultList = (props) => {
  const classes = useStyles();
  return (
    <Card className={classes.root}>
      <CardContent>
        {props.results.length === 0 ? (
          <Typography component={'span'} variant={'body2'}>
            No results
          </Typography>
        ) : (
          <Grid container className={classes.container} spacing={3}>
            {props.results.map((item, i) => (
              <Grid key={i} item>
                <ResultItem item={item} />
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultList;
