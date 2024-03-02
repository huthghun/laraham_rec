import React, { useState, useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { makeStyles } from "@mui/styles";
import { Graph } from "react-d3-graph";
import FormControlLabel from '@mui/material/FormControlLabel';
import CourseHeader from "./courseHeader";
import { useHttpClient } from "../hooks/useHttp"; 
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Plot from 'react-plotly.js';
import InputLabel from '@mui/material/InputLabel';
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
const minDistance = 1;
export default function NetGraph({ setToken })  {

    const classes = useStyles();
    const [data, setData] = useState([]);
    const [pdata, setPdata] = useState([]);
    const [layout, setLayout] = useState({});
    const [semester, setSemester] = useState('');
    const [language, setLanguage] = useState('');
    const study = sessionStorage.getItem("study");
    const { sendRequest } = useHttpClient();
    const [credits, setCredits] = useState([2, 9]);
    const [sws, setSws] = useState([1, 6]);
    const [value, setValue] = useState(0);
    const [score, setScore] = useState(0);
    const [goal, setGoal] = useState("rotation");
    const [open, setOpen] = React.useState(false);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        setOpen(true);
    };
    const myConfig = {
        "automaticRearrangeAfterDropNode": true,
        "collapsible": true,
        "directed": false,
        "focusAnimationDuration": 1.75,
        "focusZoom": 1,
        "freezeAllDragEvents": false,
        "height": 700,
        "highlightDegree": 1,
        "highlightOpacity": 0.2,
        "linkHighlightBehavior": true,
        "maxZoom": 10,
        "minZoom": 0.5,
        "nodeHighlightBehavior": true,
        "panAndZoom": false,
        "staticGraph": false,
        "staticGraphWithDragAndDrop": false,
        "width": 1400,
        "d3": {
            "alphaTarget": 0.05,
            "gravity": -400,
            "linkLength": 10,
            "linkStrength": 100,
            "disableLinkForce": false
        },
        "node": {
            "color": "#d3d3d3",
            "fontColor": "black",
            "fontSize": 12,
            "fontWeight": "normal",
            //"highlightColor": "red",
            "highlightFontSize": 16,
            "highlightFontWeight": "bold",
            "highlightStrokeColor": "red",
            "highlightStrokeWidth": 1.5,
            "mouseCursor": "pointer",
            "opacity": 0.9,
            "renderLabel": true,
            "size": 200,
            "strokeColor": "black",
            "strokeWidth": 1.5,
            "svg": "",
            "labelProperty":"labelProperty",
            "symbolType": "circle"
        },
        "link": {
            "color": "lightgray",
            "fontColor": "black",
            "fontSize": 12,
            "fontWeight": "normal",
            "highlightColor": "red",
            "highlightFontSize": 16,
            "highlightFontWeight": "normal",
            "labelProperty": "label",
            "mouseCursor": "pointer",
            "opacity": 1,
            "renderLabel": true,
            "semanticStrokeWidth": false,
            "strokeWidth": 1,
            "markerHeight": 6,
            "markerWidth": 6,
            "strokeDasharray": 0,
            "strokeDashoffset": 0,
            "strokeLinecap": "butt"
        }
    };
   
   const onDoubleClickNode = function(nodeId, node) {
       // window.alert('Double clicked node ${nodeId} in position (${node.x}, ${node.y})');
   };

   
   const onMouseOverNode = function(nodeId, node) {
       // window.alert(`Mouse over node ${nodeId} in position (${node.x}, ${node.y})`);
   };
   


    const handleChange_semester = (event) => {
        setSemester(event.target.value);
    };
    const handleChange_goal = (event) => {
        setGoal(event.target.value);
    };
    const handleChange_language = async (event) => {
        setLanguage(event.target.value);
        
    };
    const handleChange1 = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
            return;
        }

        if (activeThumb === 0) {
            setCredits([Math.min(newValue[0], credits[1] - minDistance), credits[1]]);
        } else {
            setCredits([credits[0], Math.max(newValue[1], credits[0] + minDistance)]);
        }
    };
    const handleChange3 = (event, newValue) => {
        setScore(newValue);
    };
    const handleChange2 = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
            return;
        }

        if (activeThumb === 0) {
            setSws([Math.min(newValue[0], sws[1] - minDistance), sws[1]]);
        } else {
            setSws([sws[0], Math.max(newValue[1], sws[0] + minDistance)]);
        }
    };
    async function handleClick() {
        
        //const token = sessionStorage.getItem('token');
        try {
            const s = JSON.stringify( {goal: goal, "type":value, "score": score, "args":{"study":study, "rotation":{$regex : semester}, "language": {$regex : language}, "sws":{$gt: sws[0]-1, $lt:sws[1]+1}, "credits":{$gt: credits[0]-1, $lt:credits[1]+1}}})
        const [responseData, statusOk] = await sendRequest(
            `/vis2`,
            "POST",
            s,
            {
            "Content-Type": "application/json",
            }
        );
        if (statusOk) {
            if (value === 0){
                setData(responseData.vis);
            }else{
                setData({nodes:[], links:[]}); 
                const date_json = JSON.parse(responseData.vis)
                setPdata(date_json.data);
                let lay = date_json.layout;
                lay.responsive= true;
                lay.autosize= true;
                lay.useResizeHandler= true;
                lay.width= 1200;
                lay.height= 700 - 50*value;
                lay.dragmode= "pan";
                lay.clickmode ="select";
                lay.hovermode = "closest";
                lay.scattergap = 1;
                lay.scattermode="overlay";


            setLayout(lay);
            }
            
        }
        } catch (err) {}
        setOpen(false);
    }
    useEffect(() => {
        handleClick();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [semester, language,sws,credits,value, score, goal]);

    return (
        <div>
        <CssBaseline />
        <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
        <CourseHeader setToken={setToken}/>

        <Container sx={{ maxWidth:'95%'  }} maxWidth={false} className={classes.container}>
        <Typography variant={"h5"} component={"h2"}>
        Visualization
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} >
            <Tab label={`Network`} {...a11yProps(0)} />
            <Tab label={`Top 5`} {...a11yProps(1)} />
            <Tab label={`Rotation / Language`} {...a11yProps(2)} />
        </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
            <Grid container spacing={3}>
            <Grid xs={2}>
                <FormControl variant="filled" component="span">
            <FormControlLabel 
            labelPlacement="top"
            label="Semester"
            control={<Select sx={{ m: 1, minWidth: 120 }}
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={semester}
            onChange={handleChange_semester}
            label="Semester"
            >
            <MenuItem value="">
                <em>None</em>
            </MenuItem>
            <MenuItem value={"SS"}>SS</MenuItem>
            <MenuItem value={"WS"}>WS</MenuItem>
            </Select>}
            />

            <FormControlLabel 
            labelPlacement="top"
            label="Language"
            control={<Select sx={{ m: 1, minWidth: 120 }}
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={language}
                onChange={handleChange_language}
                label="language"
                >
                <MenuItem value="">
                    <em>None</em>
                </MenuItem>
                <MenuItem value={"english"}>English</MenuItem>
                <MenuItem value={"german"}>German</MenuItem>
                </Select>}
            />

            <FormControlLabel 
            labelPlacement="top"
            label="Credits"
            control={<Slider sx={{ m: 1, minWidth: 120 }}
                getAriaLabel={() => 'Minimum distance'}
                value={credits}
                size="small"
                aria-label="Small"
                min={2}
                step={1}
                max={9}
                onChange={handleChange1}
                valueLabelDisplay="auto"
                disableSwap
                marks={[{value:2, label:"2"},{value:9, label:"9"}]}
        />}
            />
            <FormControlLabel 
            labelPlacement="top"
            label="SWS"
            control={<Slider sx={{ m: 1, minWidth: 120 }}
                getAriaLabel={() => 'Minimum distance'}
                value={sws}
                size="small"
                aria-label="Small"
                min={1}
                step={1}
                max={6}
                onChange={handleChange2}
                valueLabelDisplay="auto"
                disableSwap
                marks={[{value:1, label:"1"},{value:6, label:"6"}]}
        />}
            />
            <FormControlLabel 
            labelPlacement="top"
            label="Score"
            control={<Slider sx={{ m: 1, minWidth: 120 }}
                value={score}
                size="small"
                aria-label="Small"
                min={0.01}
                step={0.01}
                max={1}
                onChange={handleChange3}
                valueLabelDisplay="auto"
                marks={[{value:0.01, label:"0.01"},{value:1, label:"1.0"}]}
        />}
            />
        </FormControl>
            </Grid>
            <Grid xs={9}>
                <Typography>
                <Graph 
            id = "graph-id" 
            data={data}
            config={myConfig}
            onDoubleClickNode={onDoubleClickNode}
            onMouseOverNode={onMouseOverNode}
        />
        </Typography>
            </Grid>
            </Grid>

        </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <div style={{width:1200,height:700}}>
        <Plot 
            data={pdata}
            layout={layout}
            useResizeHandler={true}
            config={{scrollZoom: true, modeBarButtonsToRemove: ['lasso2d', 'select2d','zoom'],responsive: true,modeBarButtonsToAdd: ['hoverClosestGl2d', 'toggleHover']}}
            style={{width: "100%", height: "100%"}}
        />
</div>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
      <div style={{width:1200,height:700}}>
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id="demo-simple-select-standard-label"></InputLabel>
      <Select sx={{ m: 1, minWidth: 120 }}
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={goal}
            onChange={handleChange_goal}
            label="Semester"
            >
            <MenuItem value={"rotation"}>rotation</MenuItem>
            <MenuItem value={"language"}>language</MenuItem>
            </Select> </FormControl>
      <Plot 
            data={pdata}
            layout={layout}
            useResizeHandler={true}
            config={{scrollZoom: true, modeBarButtonsToRemove: ['lasso2d', 'select2d','zoom'],responsive: true,modeBarButtonsToAdd: ['hoverClosestGl2d', 'toggleHover']}}
            style={{width: "100%", height: "100%"}}
        />
      </div>
      </CustomTabPanel>
      
        </Container>

        </div>
    );
}

