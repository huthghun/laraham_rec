import React from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    //maxWidth: 365,
    width: 500,
    height: 150,
    flexGrow:1,
    flexBasis: 0

  },
  media: {
    height: 150,
  },
});

const ResultItem = (props) => {
  const classes = useStyles();
  let navigate = useNavigate(); 
  const routeChange = () =>{ 
    let path = `/courses/view?id=${props.item._id}`;
    console.log(path);
    navigate(path);
    window.location.reload(false);

  }

  return (
    <Card className={classes.root} variant="outlined" onClick={routeChange}>
      <CardActionArea className={classes.media}>
        <CardContent>
          <Typography style={{width:"90%"}} gutterBottom variant="h6" component="h2">
            {props.item.title}
          </Typography>
          <Typography variant="subtitle" color="textSecondary" component="span">
            {props.item.teacher}
            <Typography variant="overline" display="block" color="textSecondary" component="span">
            SWS: {props.item.sws}
          </Typography>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ResultItem;
