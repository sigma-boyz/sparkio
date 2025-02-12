import React, { useEffect, useState } from 'react'
import "./list.css"
import User from './userInfo/user'
import ChatList from './chatList/chatList'
import { useGlobalState } from '../../backend/globalStates'
const List = () => {

  const {currentChatUID} = useGlobalState()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 500);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 500);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`list ${currentChatUID !== null && isMobile ? "close":""}`}>
      <User />
      <ChatList />
    </div>
  )
}

export default List