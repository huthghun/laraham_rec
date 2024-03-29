import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { useHttpClient } from "../hooks/useHttp"; 
import { useNavigate } from "react-router-dom";

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit">
        LA RAHAM
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignUp( {setToken}) {
  const [errorMessage, setErrorMessage] = React.useState("");
  let navigate = useNavigate(); 
  const routeChange = () =>{ 
    let path = `/home`;
    navigate(path);
    window.location.reload(false);
      
  }
  const { sendRequest } = useHttpClient();
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const firstName = data.get('firstName');
    const lastName = data.get('lastName');
    const study = data.get('study');
    const body = {email: email, password: password, firstname: firstName, lastname: lastName, study:study};
    try {
      const [responseData, statusOk] = await sendRequest(
        `/signup`,
        "POST",
        JSON.stringify(body),
        {
          "Content-Type": "application/json",
        }
      );
      if (statusOk) {
        if(responseData._id !== undefined){
          setToken(responseData._id);
          sessionStorage.setItem('firstname', responseData.firstname);
          sessionStorage.setItem('lastname', responseData.lastname);
          sessionStorage.setItem('study', responseData.study);
          routeChange();
        }else{
          setErrorMessage("Account exists already");
        }
        

      }
    } catch (err) {}
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12}>
              <FormControl fullWidth>
              <InputLabel id="demo-simple-select-standard-label">study</InputLabel>
                <Select
                  labelId=""
                  fullWidth
                  required
                  name="study"
                  label="study"
                  id="study"
                  defaultValue = "BAI"
      
                >
                    <MenuItem value={"BAI"}>BAI</MenuItem>
                    <MenuItem value={"MAI"}>MAI</MenuItem>
                </Select>
                </FormControl>
              </Grid>
              <label style={{color:"red"}}>{errorMessage}</label>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}