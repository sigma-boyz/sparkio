import './App.css';
import Chat from './components/chat/chat';
import List from './components/list/List';
import Sidebar from './components/sidebar/Sidebar'
import Register from './components/register/register';
import Account from './components/account/Account'
import { Notification } from './components/Notification';
import Loading from './components/loading/Loading';
import { userInfo } from './backend/userInfo';
import { useState } from 'react';
import Friends from './components/friends/Friends';

function App() {
  const{ user, IsLoading } = userInfo()
  const [window, setWindow] = useState("home")

  if(IsLoading)return <Loading/>
  return (
    <div className="container">
      {user ?( 
      <>
       <Sidebar setWindow={setWindow}/>
       {window === "home" && 
       <>
         <List/>
         <Chat/>
       </>
       }
       {window === "friends" && <Friends/>}
       {window === "account" && <Account setWindow={setWindow}/>}
      </>):(
      <Register/>)}
      <Notification />
    </div>
  );
}

export default App;
