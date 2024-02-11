import React, { useState, useEffect } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";

import ResultList from "./ResultList";
import CourseHeader from "./courseHeader";
import { useHttpClient } from "../hooks/useHttp"; 
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

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

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
export default function Home({ setToken })  {

  const classes = useStyles();
  const [my_courses, setMy_courses] = useState([]);
  const [rec, setRec] = useState([]);
  const [rec2, setRec2] = useState([]);
  const [open, setOpen] = React.useState(false);

 
  const { sendRequest } = useHttpClient();
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  async function handleClick() {
    setOpen(true);
    const token = sessionStorage.getItem('token');

    
    try {
      const [responseData, statusOk] = await sendRequest(
        `/home?uid=${token}`,
        "GET",
        null,
        {
          "Content-Type": "application/json",
        }
      );
      console.log(responseData);
      if (statusOk) {
        setMy_courses(responseData.my_courses);
        setRec(responseData.rec);
        setRec2(responseData.rec2);
        setOpen(false);
      }
    } catch (err) {}
  }
  useEffect(() => {
      handleClick();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Fragment>
            <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CssBaseline />
      <CourseHeader setToken={setToken}/>
      <Container sx={{ maxWidth:'95%'  }} maxWidth={false} className={classes.container}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label={`My courses (${my_courses.length})`} {...a11yProps(0)} />
          <Tab label={`Similar courses (${rec.length})`} {...a11yProps(1)} />
          <Tab label={`Recommended for you (${rec2.length})`} {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
      <Typography component="div">
          <ResultList results={my_courses} />
        </Typography>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
      <Typography component="div">
          <ResultList results={rec} />
        </Typography>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
      <Typography component="div">
      <ResultList results={rec2} />
        </Typography>
      </CustomTabPanel>
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

