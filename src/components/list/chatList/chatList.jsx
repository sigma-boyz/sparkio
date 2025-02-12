import React, { useEffect, useState } from 'react';
import "./chatList.css";
import { auth, db } from '../../../backend/firebase';
import { collection, query, where, onSnapshot, getDoc, doc, getDocs } from "firebase/firestore"; 
import { useGlobalState } from "../../../backend/globalStates";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [unseenCounts, setUnseenCounts] = useState({});
  const { changeCurrentChatUID, updateMessages, currentChatUID } = useGlobalState();
  const [activeChat, setActiveChat] = useState("");
  const [search, setSearch] = useState("");

  const currentUser = auth.currentUser;

  const changeCurrentChat = async (UID) => {
    changeCurrentChatUID(UID);

    const messagesRef = collection(db, "chats", UID, "messages");
    const querySnapshot = await getDocs(messagesRef);
    const messages = querySnapshot.docs.map(doc => doc.data());

    updateMessages(messages);
    setActiveChat(UID);

    setUnseenCounts(prev => ({
      ...prev,
      [UID]: 0,
    }));
  };

  useEffect(() => {
    if (!currentUser) return;

    const chatQuery = query(
      collection(db, "chats"),
      where("users", "array-contains", currentUser.uid)
    );

    const unsubscribeChats = onSnapshot(chatQuery, async (querySnapshot) => {
      const chatList = [];
      const unsubscribeMessagesList = [];

      for (const chatDoc of querySnapshot.docs) {
        const chatData = chatDoc.data();
        const otherUserUID = chatData.users.find(uid => uid !== currentUser.uid);

        if (!otherUserUID) continue;

        const userDocRef = doc(db, "users", otherUserUID);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();

          chatList.push({
            chatID: chatDoc.id,
            username: userData.username,
            profileURL: userData.profileURL,
            lastMessage: chatData.lastMessage || "",
            lastMessageTimestamp: chatData.lastMessageTimestamp || null,
          });

          const messagesRef = collection(db, "chats", chatDoc.id, "messages");
          const unseenQuery = query(messagesRef, where("seen", "==", false), where("sender", "==", otherUserUID));

          const unsubscribeMessages = onSnapshot(unseenQuery, (messageSnapshot) => {
            setUnseenCounts(prev => ({
              ...prev,
              [chatDoc.id]: messageSnapshot.size,
            }));
          });

          unsubscribeMessagesList.push(unsubscribeMessages);
        }
      }

      chatList.sort((a, b) => (b.lastMessageTimestamp?.toMillis() || 0) - (a.lastMessageTimestamp?.toMillis() || 0));
      setChats(chatList);

      return () => {
        unsubscribeMessagesList.forEach(unsub => unsub());
      };
    });

    return () => unsubscribeChats();
  }, [currentUser]);

  const filterChat = chats.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className='chatList'>
      <div className='search'>
        <div className='searchBar'>
          <input 
            type="search" 
            placeholder='Search' 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {filterChat.map((chat) => (
        <div 
          key={chat.chatID} 
          className='item' 
          style={{ background: activeChat === chat.chatID ? "#5183fe" : "#1a1d23" }} 
          onClick={() => changeCurrentChat(chat.chatID)}
        >
          {unseenCounts[chat.chatID] > 0 && chat.chatID !== currentChatUID && (
            <div className="unseen-badge">{unseenCounts[chat.chatID]}</div>
          )}
          <img src={chat.profileURL || "./profile.png"} alt="Profile" />
          <div className='texts'>
            <div className='name'>{chat.username}</div>
            <div className='lastmsg'>{chat.lastMessage}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
