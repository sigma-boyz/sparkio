import React, { useState } from 'react';
import "./register.css";
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../backend/firebase';
import { doc, setDoc } from 'firebase/firestore';

const Register = () => {
  const [IsLogin, setIsLogin] = useState(false);
  const [IsRegistering, setIsRegistering] = useState(false)

  const handleLogin = async(e)=>{
    e.preventDefault();
    setIsRegistering(true)
    const formData = new FormData(e.target)
    const { email, password } = Object.fromEntries(formData)
    try{
      await signInWithEmailAndPassword(auth, email, password)
      toast.success("Logged in successfully")
    }catch(err){
      const error = formatFirebaseError(err.code)
      toast.error(error)
    }
    setIsRegistering(false)
  }
  const handleSignin = async (e) => {
    e.preventDefault();
    setIsRegistering(true);

    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid),{
          username,
          email,
          imageURL: "",
          id: res.user.uid,
          friends:[],
        })
        toast.success("Account successfully created!");
    } catch (err) {
        const errorMessage = formatFirebaseError(err.code);
        toast.error(errorMessage);
    }
    setIsRegistering(false);
};
const formatFirebaseError = (error) => {
    const errorMessages = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Invalid email format.",
        "auth/weak-password": "Password must be at least 6 characters long.",
        "auth/missing-password": "Please enter a password.",
        "auth/internal-error": "An internal error occurred. Try again.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/too-many-requests": "Too many failed login attempts. Please try again later.",
        "auth/account-exists-with-different-credential": "An account already exists with the same email, but through a different sign-in method.",
        "auth/invalid-credential": "Invalid email or password.",
        "auth/requires-recent-login": "Please log in again to perform this action.",
        "auth/email-not-verified": "Please verify your email address.",
    };

    return errorMessages[error] || "An error occurred. Please try again.";
};

  return (
    <div className='container'>
        <div className="login">
          <div className="switcher">
            <button 
              className={IsLogin ? "active" : ""}
              onClick={() => setIsLogin(true)}
            >Login</button>
            <button 
              className={!IsLogin ? "active" : ""}
              onClick={() => setIsLogin(false)}
            >Sign In</button>
          </div>

          <div className="title">{IsLogin ? "Login" : "Sign in"}</div>

          {IsLogin ? (
            <div>
              <form onSubmit={handleLogin}>
                <input type="text" name="email" placeholder='Enter your email' required/>
                <input type="password" name='password' placeholder='Enter your password' required/>
                <button type='submit' disabled={IsRegistering} >Login</button>
              </form>
            </div>
          ) : (
            <div>
              <form onSubmit={handleSignin}>
                <input type="text" name='username' placeholder='Enter your username' />
                <input type="email" name='email' placeholder='Enter your email' required/>
                <input type="password" name='password' placeholder='Enter your password' required/>
                <button type="submit" disabled={IsRegistering}>Sign In</button>
              </form>
            </div>
          )}
        </div>
    </div>
  );
}

export default Register;
