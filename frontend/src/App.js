import React from "react";
import "./App.css";

import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Courses from './components/courses';
import CourseDetails from '../src/components/courseDetails';
import SignUp from '../src/components/SignUp';
import Home from './components/home';

import Login from '../src/components/login';
import useToken from '../src/components/useToken';


function App() {
  const { token, setToken } = useToken();
  //const [token, setToken] = useState();

  console.log(token);
  if(!token) {
    return (
      <div className="wrapper">
        <Router>
          <Routes>
            <Route path="/signup" element={<SignUp setToken={setToken} />}/>
            <Route path="*" element={ <Login setToken={setToken} />}/ >  
          </Routes>
        </Router>
      </div>
    );
   // return <Login setToken={setToken} />
  }

  return (
    <div className="wrapper">
      <Router>
        <Routes>
          <Route path="/courses/view" Component={CourseDetails}/>
          <Route path="/courses" Component={Courses}/ >
          <Route path="*" Component={Home}/ >

        </Routes>
      </Router>
    </div>
  );
}

export default App;
