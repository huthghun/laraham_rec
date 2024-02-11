import React, { useState } from "react";
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import Container from "@mui/material/Container";
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import { useSearchParams } from 'react-router-dom';
import { useHttpClient } from "../hooks/useHttp"; 

const useStyles = makeStyles({
    btn:{
        float: "right",
        padding: "20px",
        
    },
    container: {
        paddingTop: 10

    }
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(5),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

 const Enroll = (props) =>{
    const classes = useStyles();
    const [rating1, setRating1] = useState(0);
    const [rating2, setRating2] = useState(0);
    const [rating3, setRating3] = useState(0);
    const [rating4, setRating4] = useState(0);

    const [queryParameters] = useSearchParams();
    const token = sessionStorage.getItem('token');
    const c_id = queryParameters.get("id");
    const study = sessionStorage.getItem("study");

    const [open, setOpen] = useState(false);
    const { sendRequest } = useHttpClient();

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleSubmit = async () => {
        const body = {
            "cid": c_id,
            "uid": token,
            "rating1": rating1,
            "rating2": rating2,
            "rating3":rating3,
            "rating4":rating4,
            "study": study
        };
        console.log("body: ",body);
        try {
             sendRequest(
                `/rating`,
                "POST",
                JSON.stringify(body),
                {
                "Content-Type": "application/json",
                }
            ).then(()=>{window.location.reload(false);});
            
        } catch (err) {}


        handleClose();
        
    };
    let res = <div></div>
    if (props.enrolled){
        res = <Container className={classes.container}>
        <Button className={classes.btn} variant="contained" onClick={handleClickOpen}>
        Enroll and Rating
        </Button>
        <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Enroll and rating
        </DialogTitle>
        <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            }}
        >
            <CloseIcon />
        </IconButton>
        <DialogContent dividers>
        <Typography component="legend">How happy were you with the course? </Typography><Rating
        name="rating1"
        value={rating1}
        onChange={(event, newValue) => {
            setRating1(newValue);
        }}
        precision={1.0}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}/>
        
        <Typography component="legend">How helpful was the course? </Typography><Rating
        name="rating2"
        value={rating2}
        onChange={(event, newValue) => {
            setRating2(newValue);
        }}
        precision={1.0}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}/>
        <Typography component="legend">How easy was the course? </Typography><Rating
        name="rating3"
        value={rating3}
        onChange={(event, newValue) => {
            setRating3(newValue);
        }}
        precision={1.0}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}/>
        <Typography component="legend">What is the probability of you recommending this course to others? </Typography><Rating
        name="rating4"
        value={rating4}
        onChange={(event, newValue) => {
            setRating4(newValue);
        }}
        precision={1.0}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}/>
        </DialogContent>
        <DialogActions>
            <Button type="submit" onClick={handleSubmit} >
            Save
            </Button>
        </DialogActions>
        </BootstrapDialog>
    </Container>
    }


    return(res);
}

export default Enroll;