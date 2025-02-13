import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { collection, doc, getDoc, getDocs, onSnapshot, updateDoc, where, query } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import { toast } from 'react-toastify';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [currentChatUID, setcurrentChatUID] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (currentChatUID) {
      console.log(`Calling clearUnseen from useEffect. Current chat: ${currentChatUID}`);
      clearUnseen(currentChatUID);
    }
  }, [currentChatUID]);

  useEffect(() => {
    if (!auth.currentUser) return;


    const chatsRef = collection(db, "chats");
    const chatsQuery = query(chatsRef, where("users", "array-contains", auth.currentUser.uid));

    const unsubscribeChats = onSnapshot(chatsQuery, (chatsSnapshot) => {

      const unsubscribers = [];

      chatsSnapshot.forEach((chatDoc) => {
        const chatID = chatDoc.id;
        const messagesRef = collection(db, "chats", chatID, "messages");

        const unsubscribeMessages = onSnapshot(messagesRef, (messagesSnapshot) => {

          if (currentChatUID && currentChatUID === chatID) {
            clearUnseen(chatID);
          }
        });

        unsubscribers.push(unsubscribeMessages);
      });

      return () => {
        unsubscribers.forEach((unsubscribe) => unsubscribe());
      };
    });

    return () => unsubscribeChats();
  }, [currentChatUID, auth.currentUser]);

  const changeProfilePic = async (uid, URL) => {
    await updateDoc(doc(db, "users", uid), {
      profileURL: URL
    });
    console.log(`Profile picture updated for ${uid}`);
  };

  const fetchUserData = async (user) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setCurrentUserData(userData);
      } else {
        setCurrentUserData(null);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      toast.error("Failed to fetch user data");
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        setCurrentUserData(snapshot.data());
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      fetchUserData(user);
    });

    return () => unsubscribe();
  }, []);

  const changeCurrentChatUID = async (UID) => {
    setcurrentChatUID(UID);
    if (UID) {
      clearUnseen(UID);
    }
  };

  const clearUnseen = async (UID) => {
    if (!UID || !auth.currentUser) return;

    const messagesRef = collection(db, "chats", UID, "messages");
    const messagesSnapshot = await getDocs(messagesRef);

    messagesSnapshot.forEach(async (messageDoc) => {
      const messageData = messageDoc.data();

      if (messageData.sender !== auth.currentUser.uid && !messageData.seen) {
        const messageRef = doc(db, "chats", UID, "messages", messageDoc.id);
        await updateDoc(messageRef, { seen: true });
        console.log(`Marked message ${messageDoc.id} as seen`);
      }
    });
  };

  const updateMessages = (messages) => {
    setMessages(messages);
  };

  return (
    <GlobalStateContext.Provider value={{ currentUser, currentUserData, currentChatUID, changeCurrentChatUID, messages, updateMessages, changeProfilePic, clearUnseen }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  return useContext(GlobalStateContext);
};
