import React, { useState } from "react";
import { FaPencilAlt, FaTrash, FaSignOutAlt, FaUserSlash, FaLessThanEqual } from "react-icons/fa";
import "./account.css";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, signOut } from "firebase/auth";
import { auth, db } from "../../backend/firebase";
import { deleteDoc } from "firebase/firestore";
import { useGlobalState } from "../../backend/globalStates";
import { OrbitProgress } from "react-loading-indicators";

const Account = ({setWindow}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false)

  const { currentUserData, profilePic ,changeProfilePic, changeCurrentChatUID } = useGlobalState()

  const handleEditProfile = () => {
    document.getElementById("imageInput").click()
  };
  const setProfilePic = async(e)=>{
    setUrlLoading(true)
    const file = e.target.files[0]
    if(file){
      const formData = new FormData()
      formData.append("files",file)
      const res = await fetch("https://chatlink-server-4zto.onrender.com/upload",{
        method:"POST",
        body:formData
      })
      const data = await res.json()
      
      await fetch("https://chatlink-server-4zto.onrender.com/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: currentUserData.profileURL })
      });
      changeProfilePic(auth.currentUser?.uid, data[0].url)
      setUrlLoading(false)
    }
  }
  const handleDeleteProfilePic = async() => {
    
    const res = await fetch("https://chatlink-server-4zto.onrender.com/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentUserData.profileURL})
    });
    console.log(res)
    changeProfilePic(auth.currentUser.uid,"")
  };

  const handleLogout = async() => {
    await signOut(auth)
    setWindow("home")
    changeCurrentChatUID(null)
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser
    if (user) {
      const credential = EmailAuthProvider.credential(
        user.email,  
        prompt("Please enter your password to proceed with account deletion.")  // Prompt the user to enter their password
      );
      try {
        await reauthenticateWithCredential(user, credential);
        await deleteUser(user.id)
        await deleteDoc(doc(db,"users",user.id))
        setShowPopup(false)
      } catch (error) {
        console.error("Re-authentication failed:", error);
        setShowPopup(false)
        alert("invaild password")
      }
    }
  };

  return (
    <div className="account-container">
      <h2 className="account-title">My Account</h2>
      <div className="account-card">
        {/* Blue Banner */}
        <div className="account-banner"></div>

        {/* Profile Picture Section */}
        <div className="profile-section">
          <div className="profile-wrapper">
            {!urlLoading && <img src={profilePic || currentUserData?.profileURL ||"./profile.png"} alt="Profile" className="profile-pic" />}
            {urlLoading && <OrbitProgress variant="track-disc" color="#5183fe" size="small" text="" textColor="" className="profile-pic" /> }
            <button className="icon-btn delete-btn" onClick={handleDeleteProfilePic}>
              <FaTrash />
            </button>
            <button className="icon-btn edit-btn" onClick={handleEditProfile}>
              <FaPencilAlt />
            </button>
            <input type="file" id="imageInput" accept="image/*" style={{display:"none"}} onChange={setProfilePic}/>
          </div>
        </div>

        {/* Info Section */}
        <div className="account-info">
          <div className="info-item">
            <span className="label">Username</span>
            <span className="value">{currentUserData?.username}</span>
          </div>
          <div className="info-item">
            <span className="label">Email</span>
            <span className="value">{currentUserData?.email}</span>
          </div>
          <div className="button-group">
            <button className="small-btn logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Log Out
            </button>
            <button className="small-btn delete-account-btn" onClick={() => setShowPopup(true)}>
              <FaUserSlash /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <p>Do you want to delete this account?</p>
            <button className="cancel-btn" onClick={() => setShowPopup(false)}>Cancel</button>
            <button className="confirm-delete-btn" onClick={handleDeleteAccount}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
