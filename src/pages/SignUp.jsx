import React from 'react'
import { useState } from 'react'
import LogoImage from "../assets/logo.jpg"
import { useNavigate, NavLink } from 'react-router';
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import "./login.css"

const SignUp = () => {


     const [showPassword, setShowPassword] = useState(false);
        const [user, setUser] = useState({
            username: "",
            email: "",
            password: "",
            role: "",
            otherCategory: "",
            
    
        })
    
        const [error, setError] = useState({
            username: "",
            email: "" ,
            password: "",
            role: "",
            otherCategory: "",
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
    
            if (name === "password") {
                if (value === ""){
                    newError.password = "Password is Required"
    
                }else if (value.length > 8){
                    newError.password ="Password must be at least 8 characters"
                } else {
                    newError.password = "";
                }
            }
            
            if (name === "username") {
              if (value === "") {
                newError.username = value === "" ? "Enter Full name" : "" ;
    
            }
          }
          if (name === "role") {
            if (value === "") {
              newError.role = value === "" ? "Select a role" : "" ;
            }
          }
          if (name === "otherCategory") {
            if (value === "") {
              newError.otherCategory = value === "" ? "Enter your professional role" : "" ;
            }
          }
            setError(newError);
    
         }
       const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
      e.preventDefault();
     
      try{
        const response = await fetch("https://project-finder-q5t2.onrender.com/api/auth/registration/", {


          method:"POST",
          headers : {"Content-Type" : "application/json" },
          body: JSON.stringify({
            username: user.username,
            email: user.email,
            password1: user.password,
            password2: user.password,
          })



        }

        );  
  
        const data = await response.json();
        console.log(data); 

      }catch(error){
        console.log(error.message)

      }
    




  let newError = {
    username: user.username === "" ? "Username is Required" : "",
    email: user.email === "" ? "Email is required"
      : !email_regex.test(user.email) ? "Invalid email address"
      : "",
    password: user.password === "" ? "Password is Required" : "",
     role: user.role === "" ? "Select a role" : "",
     otherCategory: user.role === "Others" && user.otherCategory === "" ? "Enter your professional role" : "",
  };
 
  setError(newError);
  const hasErrors = Object.values(newError).some((msg) => msg !== "");
  if (hasErrors) return;

    alert("Account created! You can now log in.");
  navigate("/");
};
    

  return (
   <div className="login-container">
           <div className="login-heading">
               <img src={LogoImage} alt="Logo" className="logo-image" />
               <h1 className="logo-text"> PROJECT FINDER</h1>     
           </div>
           <h3 className="welcome-text">Let's get you started</h3>
   
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

                  <label htmlFor="role">Professional Role</label>
                  {/* <input type="text"
                         name="role"
                         value={user.role}
                         onChange={handleChange}
                         className={error.role ? "input-error" : ""}
                         placeholder="Enter your professional role"
                  /> */}

                 <select id="role" name="role" value={user.role} onChange={handleChange} className={error.role ? "input-error" : ""}>
                   <option value="">Select Professional Role</option>
                  <option value="project-manager">Project Manager</option>
                  <option value="Project Coordinator">Project Coordinator</option>
                  <option value="Project Support Officer">Project Support Officer</option>
                  <option value="Project Delivery Support Officer">Project Delivery Support Officer</option>
                  <option value="Project Officer">Project Officer</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Others">Others</option>
                  <option value=""></option>
                 </select>

                  {error.role && <p className="error">{error.role}</p>}


                  {user.role === "Others" && (

                      <>
                      <label htmlFor="otherCategory">Please specify your professional role</label>
                      <input type="text"
                             name="otherCategory"
                             value={user.otherCategory}
                              onChange={handleChange}
                              className={error.otherCategory ? "input-error" : ""}
                              placeholder="Enter your professional role"
                      />
                      {error.otherCategory && <p className="error">{error.otherCategory}</p>}
                      </>
                  )

                      
                      } 






                  

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
     {error.password && <p  className="error">{error.password}</p>}
     <button
       type="button"
       className="toggle-password"
       onClick={() => setShowPassword(!showPassword)}
     >
       
       {showPassword ? <IoMdEyeOff  size={18} /> : <IoMdEye  size={18} />}
     </button>
   </div>
   
           <button type="submit" >Log In</button>
           </form>
   
           
           <p className="p-2">Already have an account? <NavLink to="/login" className="text-blue-600">Sign In</NavLink></p>
   
   
       </div>
     );
   };
     
   
   

export default SignUp