import React, { useState, useEffect } from "react";
import "./sidebar.css";
import { FaHome, FaUserFriends, FaCog, FaUser } from "react-icons/fa";
import { useGlobalState } from "../../backend/globalStates";

const Sidebar = ({ setWindow }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 500);
  const {currentChatUID} = useGlobalState()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 500);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`${isMobile ? "bottom-bar" : "sidebar"} ${currentChatUID && isMobile ? "close": ""}`}>
      {isMobile ? (
        <>
          <FaHome className="icon" title="Home" onClick={() => setWindow("home")} />
          <FaUserFriends className="icon" title="Friends" onClick={() => setWindow("friends")} />
          <FaCog className="icon" title="Settings" />
          <FaUser className="icon" title="Account" onClick={() => setWindow("account")} />
        </>
      ) : (
        <>
          <div className="top-icons">
            <FaHome className="icon" title="Home" onClick={() => setWindow("home")} />
          </div>
          <div className="bottom-icons">
            <FaUserFriends className="icon" title="Friends" onClick={() => setWindow("friends")} />
            <FaCog className="icon" title="Settings" />
            <FaUser className="icon" title="Account" onClick={() => setWindow("account")} />
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
