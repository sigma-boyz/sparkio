import React, { useEffect, useState } from 'react'
import "./user.css"
import { auth } from '../../../backend/firebase'
import { useGlobalState } from '../../../backend/globalStates'
import { OrbitProgress } from 'react-loading-indicators'

const User = () => {
  const { currentUserData } = useGlobalState();  

  if (!currentUserData) {
    return <OrbitProgress variant="track-disc" color="#5183fe" size="small" text="" textColor="" className="loader" />
  }

  return (
    <div className='userInfo'>
        <div className='user'>
            <img src={currentUserData?.profileURL || "./profile.png"} alt="pic" />
            <div className='name'>{currentUserData.username}</div> 
        </div>
    </div>
  );
}

export default User;
