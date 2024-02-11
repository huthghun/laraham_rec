    import React, { useState, useEffect } from "react";

    import CssBaseline from "@mui/material/CssBaseline";
    import Typography from "@mui/material/Typography";
    import Container from "@mui/material/Container";
    import InputLabel from '@mui/material/InputLabel';
    import MenuItem from '@mui/material/MenuItem';
    import FormControl from '@mui/material/FormControl';
    import Select from '@mui/material/Select';
    import { makeStyles } from "@mui/styles";

    import CourseHeader from "./courseHeader";
    import { useHttpClient } from "../hooks/useHttp"; 
    import Plot from 'react-plotly.js';
    import Slider from '@mui/material/Slider';

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

    const minDistance = 1;
    export default function Visualization({ setToken })  {

    const classes = useStyles();
    const [data, setData] = useState([]);
    const [layout, setLayout] = useState({});
    const [semester, setSemester] = useState('');
    const [language, setLanguage] = useState('');
    const study = sessionStorage.getItem("study");
    const { sendRequest } = useHttpClient();
    const [credits, setCredits] = useState([2, 9]);
    const [sws, setSws] = useState([1, 6]);

    const handleChange_semester = (event) => {
        setSemester(event.target.value);
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

        try {
            const s = JSON.stringify( {"study":study, "rotation":{$regex : semester}, "language": {$regex : language}, "sws":{$gt: sws[0]-1, $lt:sws[1]+1}, "credits":{$gt: credits[0]-1, $lt:credits[1]+1}})
        const [responseData, statusOk] = await sendRequest(
            `/vis`,
            "POST",
            s,
            {
            "Content-Type": "application/json",
            }
        );
        if (statusOk) {
            const date_json = JSON.parse(responseData.vis)
            setData(date_json.data); 
            let lay = date_json.layout;
            lay.responsive= true;
            lay.autosize= true;
            lay.useResizeHandler= true;
            lay.width= 1200;
            lay.height= 800;
            lay.dragmode= "pan";
            lay.clickmode ="select";
            lay.hovermode = "closest";
            lay.scattergap = 1;
            lay.scattermode="overlay";


            setLayout(lay);
        }
        } catch (err) {}
    }
    useEffect(() => {
        handleClick();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [semester, language,sws,credits]);

    return (
        <div>
        <CssBaseline />
        <CourseHeader setToken={setToken}/>

        <Container sx={{ maxWidth:'95%'  }} maxWidth={false} className={classes.container}>
        <Typography variant={"h5"} component={"h2"}>
        Visualization
            </Typography>
        <Typography component="div">
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">Semester</InputLabel>
            <Select
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
            </Select>
        </FormControl>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">Language</InputLabel>
            <Select
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
            </Select>
            </FormControl>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label">Credits</InputLabel>
        <Typography><br></br> </Typography>
            <Slider
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
        />
        </FormControl>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label">SWS</InputLabel>
        <Typography><br></br> </Typography>
            <Slider
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
        />
        </FormControl> 
            </Typography>
            <Typography style={{width: "100%", height: "100%"}}>
            <Plot 
            data={data}
            layout={layout}
            useResizeHandler={true}
            config={{scrollZoom: true, modeBarButtonsToRemove: ['lasso2d', 'select2d','zoom'],responsive: true,modeBarButtonsToAdd: ['hoverClosestGl2d', 'toggleHover']}}
            style={{width: "100%", height: "100%"}}
        />
        </Typography>
        
        </Container>
    
        </div>
    );
}

