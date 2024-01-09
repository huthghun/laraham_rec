import React from "react";
import {
  AppBar,
  Toolbar,
  CssBaseline,
  Typography
} from "@mui/material";
import { makeStyles } from '@mui/styles';

import { Link } from "react-router-dom";
import Logo from "../Icons/logo";

const useStyles = makeStyles((theme) => ({
  navlinks: {
    marginLeft: 10,
    display: "flex",
  },
 logo: {
    //flexGrow: "1",
    cursor: "pointer",
    color: "orange",
    textDecoration: "none",

  },
  logged: {
    position: 'absolute',
    right: 30,
  },
  link: { 
    textDecoration: "none",
    color: "white",
    fontSize: "20px",
    marginLeft: 30,
    "&:hover": {
      color: "yellow",
      borderBottom: "1px solid white",
    },
  },
}));

function CourseHeader() {
    const firstName = sessionStorage.getItem('firstname');
    const lastName = sessionStorage.getItem('lastname');
   // const study = sessionStorage.getItem('study');

  const classes = useStyles();

  return (
    <AppBar position="static">
      <CssBaseline />
      <Toolbar>
        <Typography variant="h6" className={classes.logo1}>
        <Link onClick={() =>window.location.href="/home"} className={classes.link}>
          <Logo />
          </Link>
        </Typography>
        <Typography variant="h6" className={classes.logo}>
        <Link onClick={() =>window.location.href="/home"} className={classes.logo}>
         LA RAHAM
         </Link>
        </Typography>
        
          <div className={classes.navlinks}>
            <Link className={classes.link}  onClick={() =>window.location.href="/home"}>
              Home
            </Link>
            <Link  className={classes.link} onClick={() =>window.location.href="/courses"}>
              Katalog
            </Link>
          </div>
          <Typography variant="span" className={classes.logged}>
            {firstName} {lastName}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
export default CourseHeader;