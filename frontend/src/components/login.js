import React from 'react';
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


export default function Login({ setToken }) {
  const [errorMessage, setErrorMessage] = React.useState("");
  let navigate = useNavigate(); 
          const routeChange = () =>{ 
            let path = `/home`;
            navigate(path);
            window.location.reload(false);
        
          }
  const { sendRequest } = useHttpClient();
    const handleSubmit = async (e) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      const email = data.get('email');
      const password = data.get('password');
      const body = {email: email, password: password};
      try {
        const [responseData, statusOk] = await sendRequest(
          `/login`,
          "POST",
          JSON.stringify(body),
          {
            "Content-Type": "application/json",
          }
        );
        console.log("status",statusOk);
        if (statusOk) {
          console.log(responseData);
          if(responseData._id !== undefined){
            setToken(responseData._id);
            sessionStorage.setItem('firstname', responseData.firstname);
            sessionStorage.setItem('lastname', responseData.lastname);
            sessionStorage.setItem('study', responseData.study);
            routeChange();
          }else{
            setErrorMessage("login data are wrong");
            console.log(errorMessage);
          }

        }
      } catch (err) {}

      }
      
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
                Sign in
              </Typography>
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
                <label style={{color:"red"}}>{errorMessage}</label>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign In
                </Button>
                <Grid container>
                  <Grid item xs>
                    {/* <Link href="#" variant="body2">
                      Forgot password?
            </Link>*/}
                  </Grid>
                  <Grid item>
                    <Link href="/signup" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <Copyright sx={{ mt: 8, mb: 4 }} />
          </Container>
        </ThemeProvider>
      );
  }
