import React, { useState } from 'react'
import LogoImage from "../assets/logo.jpg"
import { useNavigate, NavLink } from 'react-router';
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import "./login.css"
const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",

    })

    const [error, setError] = useState({
        username: "",
        email: "" ,
        password: "",
    })

     const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


     const handleChange = (e) => {

        const {name, value} = e.target;
        setUser({...user,[name]:value})
        let newError = {...error};

        if (name === "email") {
            if (value === ""){
                newError.email = "Email is Required"
            }else if  (!email_regex.test(value)){
                newError.email = "Invalid email format";
            }else {
                newError.email ="";
            }
        }

 if (name === "username") {
              if (value === "") {
                newError.username = value === "" ? "Enter Full name" : "" ;
    
            }
          }

        if (name === "password") {
            if (value === ""){
                newError.password = "Password is Required"

            }else if (value.length > 8){
                newError.password ="Password must be at least 8 characters"
            } else {
                newError.password = "";
            }
        }


        setError(newError);

     }
   const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  try{
    const response = await fetch("https://project-finder-q5t2.onrender.com/api/auth/login/", {

      method:"POST",
      headers: {"Content-Type" : "application/json"},
      body: JSON.stringify({
          username: user.username,
          email: user.email,
          password: user.password,

      })

    }

  
);
    const data = await response.json();
    console.log(data);
  if (response.ok) {
  localStorage.setItem("token", data.access);
  navigate("/project-library");
} else {
  alert("Login failed. Check your email and password.");
}
}catch(error){
  console.log(error.message)
}











  const newError = {
     username: user.username === "" ? "Username is Required" : "",
    email:
      user.email === "" ? "Email is required"
      : !email_regex.test(user.email) ? "Invalid email address"
      : "",
    password: user.password === "" ? "Password is required" : "",
  };

  if (newError.email || newError.password) {
    setError(newError);
    return; 
  }

  
  setError({});
  

   };

  return (
    <div className="login-container">
        <div className="login-heading">
            <img src={LogoImage} alt="Logo" className="logo-image" />
            <h1 className="logo-text"> PROJECT FINDER</h1>     
        </div>
        <h3 className="welcome-text">Welcome Back</h3>

        <form className="sign-in" onSubmit={handleSubmit}>
            <label htmlFor="username">Full Name</label>
            <input type="username"
            name="username"
            value={user.username}
            placeholder="Enter Full name"
            onChange={handleChange}
            className={error.username ? "input-error" : ""}/>
            {error.email && <p className="error">{error.username}</p>}
            <label htmlFor="email">Email</label>
            <input type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
             className={error.email ? "input-error" : ""}
               />
               {error.email && <p className="error">{error.email}</p>}
            
          <label htmlFor="password">Password</label>
<div className="password-field">
  <input
    id="password"
    type={showPassword ? "text" : "password"}
    name="password"
    value={user.password}
    onChange={handleChange}
    className={error.password ? "input-error" : ""}
  />
  <button
    type="button"
    className="toggle-password"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
  </button>
</div>
{error.password && <p className="error">{error.password}</p>}

        <button type="submit" >Log In</button>
        </form>

        
        <p className="p-2">Don't have an account? <NavLink to="/signup" className="text-blue-600">Sign Up</NavLink></p>


    </div>
  );
};
  

export default Login