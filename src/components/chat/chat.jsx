import React, { useEffect, useRef, useState } from 'react';
import "./chat.css";
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiGrin } from "react-icons/bs";
import { FaRegImages, FaFile } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoMdDownload } from "react-icons/io";
import { useGlobalState } from '../../backend/globalStates';
import { auth, db } from '../../backend/firebase';
import { collection, doc, getDoc, addDoc, serverTimestamp, query, onSnapshot, orderBy, updateDoc, connectFirestoreEmulator, arrayUnion, deleteDoc, getDocs } from 'firebase/firestore';
import { OrbitProgress } from 'react-loading-indicators';

const Chat = () => {
  const { currentChatUID, messages, changeCurrentChatUID , clearUnseen} = useGlobalState();
  const [msgs, setMsgs] = useState(messages || []);
  const [userData, setUserData] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [images, setImages] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [imageID, setImageID] = useState([])
  const [date, setDate] = useState("")
  const endRef = useRef(null)
      
  useEffect(()=>{
    endRef.current?.scrollIntoView()
  },[])
  const handleMenuClick = (messageId) => {
    setOpenMenu(openMenu === messageId ? null : messageId);
 };

  const closeMenu = () => {
    setOpenMenu(null);
  };


  useEffect(() => {
    if (!currentChatUID) return;
    let unsubscribe = null;

    const fetchUserAndMessages = async () => {
      const ids = currentChatUID.split("_");
      const otherUserUID = ids.find(uid => uid !== auth.currentUser?.uid);
      if (!otherUserUID) return;

      const userDocRef = doc(db, "users", otherUserUID);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        setUserData(userDocSnapshot.data());
      }

      const messagesRef = collection(db, "chats", currentChatUID, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setMsgs(newMessages);
        newMessages.forEach((msg)=>{
          if(msg?.date){
            setDate(msg.date)
          }
        })
      });

      return unsubscribe;
    };

    fetchUserAndMessages();
    
    const list = document.getElementsByClassName('center');
    list.scrollTop = list.scrollHeight;
    return () => {
      if (unsubscribe) unsubscribe();
      setUserData(null);
      setMsgs([]);
    };
  }, [currentChatUID]);

  const handleEmoji = (emoji) => {
    setText((prev) => prev + emoji.emoji);
    setOpen(false);
  };

  const handleFileSelect = (e) => {
    setSelectedFiles(prev => [...prev, ...e.target.files]);
  };
  const handleImageSelect = (e)=>{
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...imageUrls]);
    setImages(prev =>[...prev, ...files])
  }
  const DeleteForMe = async(id)=>{
    await updateDoc(doc(db,"chats",currentChatUID,"messages",id),{
      deletedFrom : arrayUnion(auth.currentUser.uid)
    })
    try{
    const data = await getDoc(doc(db,"chats",currentChatUID,"messages",id))
    if(data.data().deletedFrom.length === 2){
      await deleteDoc(doc(db,"chats",currentChatUID,"messages",id))
      console.log("both deleted")
    }
  }catch(err){
    console.log("err",err)
  }
  setTimeout(updateLastMsg, 200);
  }
  const DeleteFromEveryone = async(id)=>{
    await deleteDoc(doc(db,"chats",currentChatUID,"messages",id))
    updateLastMsg()
  }
  const updateLastMsg = async()=>{
    let updated = 0
    const snapshot = await getDocs(collection(db, "chats", currentChatUID, "messages"));
    const messages = snapshot.docs
     .map(doc => doc.data())
     .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));

    const [uid1, uid2] = currentChatUID.split("_");
    for(const msg of messages){
      if(updated === 2)break
      if(!(msg.deletedFrom.includes(uid1)) && updated === 0){
        let lastmsg
        if(msg.imageURL){
          lastmsg = "📷 Image"
        }
        else if(msg.fileURL){
          lastmsg = "📄 File"; 
        }
        else{
          lastmsg = msg.text
        }
        await updateDoc(doc(db,"chats",currentChatUID),{
          [`lastmsg_${uid1}`]: lastmsg
        })
        updated ++
      }
      if(!(msg.deletedFrom.includes(uid2)) && updated === 1){
        let lastmsg
        if(msg.imageURL){
          lastmsg = "📷 Image"
        }
        else if(msg.fileURL){
          lastmsg = "📄 File"; 
        }
        else{
          lastmsg = msg.text
        }
        await updateDoc(doc(db,"chats",currentChatUID),{
          [`lastmsg_${uid2}`]: lastmsg
        })
        updated ++
      }
      console.log("updating")
    }
  }
  const sendMessage = async () => {
  if (!text.trim() && selectedImages.length === 0 && selectedFiles.length === 0) return;
  if (!currentChatUID || !auth.currentUser) return;

  const messagesRef = collection(db, "chats", currentChatUID, "messages");
  let lastMsg = "";
  const [uid1, uid2] = currentChatUID.split("_")

  const today = new Date().toLocaleString("en-US", {
    day: "numeric",
    month: "short",
  });

  let time = null;
  if (today !== date) {
    time = today;
  }

  if (selectedImages.length > 0) {
    let tempArray = [];
    const formData = new FormData();

    for (let img of images) {
      formData.append("files", img);
      const docRef = await addDoc(messagesRef, {
        sender: auth.currentUser.uid,
        imageURL: "UPLOADING",
        seen: false,
        date: time,
        deletedFrom:[],
        timestamp: serverTimestamp(),
      });
      tempArray.push(docRef.id);
    }

    setImageID(tempArray);
    setSelectedImages([]);

    const res = await fetch("https://chatlink-server-4zto.onrender.com/upload", {
      method: "POST",
      body: formData,
    });

    setImages([]);
    const data = await res.json();
    
    let index = 0;
    for (const img of data) {
      if (tempArray[index]) {
        await updateDoc(doc(messagesRef, tempArray[index]), {
          imageURL: img.url,
        });
      }
      index++;
    }

    tempArray = [];
    lastMsg = "📷 Image";
  }

  if (selectedFiles.length > 0) {
    let tempArray = [];
    const formData = new FormData();

    for (let file of selectedFiles) {
      formData.append("files", file);
      const docRef = await addDoc(messagesRef, {
        sender: auth.currentUser.uid,
        fileURL: "UPLOADING",
        fileName: file.name,
        seen: false,
        deletedFrom:[],
        date: time,
        timestamp: serverTimestamp(),
      });
      tempArray.push(docRef.id);
    }

    setSelectedFiles([]);

    const res = await fetch("https://chatlink-server-4zto.onrender.com/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    let index = 0;
    for (const fileData of data) {
      if (tempArray[index]) {
        await updateDoc(doc(messagesRef, tempArray[index]), {
          fileURL: fileData.url,
        });
      }
      index++;
    }

    tempArray = [];
    lastMsg = "📄 File";
  }

  if (text.trim()) {
    await addDoc(messagesRef, {
      sender: auth.currentUser.uid,
      text,
      date: time,
      deletedFrom: [],
      seen: false,
      timestamp: serverTimestamp(),
    });

    lastMsg = text;
  }

  await updateDoc(doc(db, "chats", currentChatUID), {
    [`lastmsg_${uid1}`]:lastMsg,
    [`lastmsg_${uid2}`]:lastMsg,
    lastMessageTimestamp: serverTimestamp(),
  });

  setSelectedFiles([]);
  setSelectedImages([]);
  setText("");
};

  const isYesterday = (dateString) => {
    const today = new Date();
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
  
    const parsedDate = new Date(`${dateString} ${today.getFullYear()}`); // Assume current year
    parsedDate.setHours(0, 0, 0, 0); 
  
    return parsedDate.getTime() === yesterday.getTime();
  };
  
  const truncateFileName = (name, maxLength = 15) => {
    if (name.length <= maxLength) return name;
    const parts = name.split(".");
    const ext = parts.pop();
    const base = parts.join(".");
    return base.substring(0, maxLength - ext.length - 3) + "..." + ext;
  };

  if (!currentChatUID) {
    return <div className="chat no-chat mobile">No chat selected</div>;
  }
  return (
    <div className="chat">
      <div className="top">
        <div className="user">
        <IoMdArrowRoundBack onClick={()=>changeCurrentChatUID(null)}/>
          <img src={userData?.profileURL || "./profile.png"} alt="Profile" />
          <div className='name'>{userData?.username}</div>
        </div>
      </div>

      <div className="center" id="center">
        {msgs?.map((msg) => {
          if(msg.deletedFrom.includes(auth.currentUser.uid))return
          return(
          <>
          {msg?.date && <div className='Date' id='date'>{msg.date === new Date().toLocaleString("en-US",{month:"short",day:"numeric"})&& ("today") || isYesterday(msg.date) && ("Yesterday") || (msg.date) }</div>}
          <div className={auth.currentUser.uid === msg.sender ? "message own" : "message"} key={msg.id}
          onMouseEnter={() => setHoveredMessage(msg.id)}
          onMouseLeave={() => setHoveredMessage(null)}>
          {hoveredMessage === msg.id && (<button className={`options-button ${auth.currentUser.uid === msg.sender ? "right" : "left"}`} onClick={() => handleMenuClick(msg.id)}>⋮</button>)}

            <div className='texts' key={msg.id} ref={endRef}>
              {msg.imageURL && (
                <div className='imagecontanier'>
                  {msg.imageURL === "UPLOADING" && <OrbitProgress variant="track-disc" color="#5183fe" size="medium" text="" textColor="" className="loader" />}
                  {msg.imageURL!=="UPLOADING" && <img
                  src={msg.imageURL}
                  alt="Sent"
                  className="chat-image"
                  onClick={() => setFullScreenImage(msg.imageURL)}
                 />}
                </div>
              )}
              {msg.fileURL && (
                <div className="file-message">
                  <FaFile className="file-icon" />
                  <span className="file-name">{truncateFileName(msg.fileName)}</span>
                  {msg.fileURL && (msg.fileURL !== "UPLOADING" ? <IoMdDownload className='download-icon' onClick={()=>{
                    fetch(msg.fileURL)
                    .then(response => response.blob())
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = msg.fileName;
                      a.click();
                    });
                  }}/>:<div className='file-loader'><OrbitProgress variant="track-disc" color="#5183fe" size="small" text="" textColor="" className="loader" /></div>
                )}
                </div>
              )}
              {msg.text && <p>{msg.text}</p>}
              <div className='msginfo'>
                <div>{msg.timestamp?.toDate().toLocaleString('en-US', {  
                  hour: 'numeric', minute: '2-digit', hour12: true 
                })}</div>
              </div>
            </div>
            {openMenu === msg.id && (
              <div className={`options-menu ${auth.currentUser.uid === msg.sender ? "right" : "left"}`}>
                <button onClick={() => onReply(msg)}>Reply</button>
                {!msg.imageURL && !msg.fileURL &&<button>Copy</button>}
                {msg.imageURL && <button>Download</button>}
                <button onClick={() => DeleteForMe(msg.id)}>Delete for Me</button>
                {msg.sender === auth.currentUser.uid && <button onClick={() => DeleteFromEveryone(msg.id)}>Delete for Everyone</button>}
              </div>
            )}
            {openMenu === msg.id && <div className="overlay" onClick={closeMenu}></div>}
         </div></>
        )})}
      </div>
      {selectedFiles.length > 0 && (
        <div className="file-preview-container">
          <button className="close-preview" onClick={()=>setSelectedFiles([])}>X</button>
          {selectedFiles.map((file, index) => (
            <div className="file-preview-card" key={index}>
              <FaFile className="file-preview-icon" />
              <span className="file-preview-name">{truncateFileName(file.name)}</span>
              <button className="remove-file" onClick={() => {
                setSelectedFiles(prev => prev.filter((_, i) => i !== index));
              }}>X</button>
            </div>
          ))}
        </div>
      )}
      {selectedImages.length > 0 && (
        <div className="preview-container">
          <button className="close-preview" onClick={()=>setSelectedImages([])}>X</button>
          <div className="preview-images">
            {selectedImages.map((img, index) => (
              <>
              <img key={index} src={img} alt={`Preview ${index}`} className="preview-img" />
              <button className="remove-file" onClick={() => {
                setSelectedImages(prev => prev.filter((_, i) => i !== index));
              }}>X</button>
              </>
            ))}
          </div>
        </div>
      )}
      
      <div className="bottom">
        <div className="icons">
          <FaFile className='selecticon' onClick={() => document.getElementById("sendFile").click()} />
          <FaRegImages className="selecticon" onClick={() => document.getElementById("sendImage").click()} />
        </div>
        <input type='file' id='sendFile' multiple style={{ display: "none" }} onChange={handleFileSelect} />
        <input type='file' accept='image/*' id='sendImage' multiple style={{ display: "none" }} onChange={handleImageSelect} />
        <input
          type="text"
          placeholder='Type a message...'
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
        <div className='emoji'>
          <BsEmojiGrin className='selecticon' onClick={() => setOpen((prev) => !prev)} />
          {open && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button type="button" className='sendButton' onClick={sendMessage}>Send</button>
      </div>

      {fullScreenImage && (
        <div className="full-screen-overlay" onClick={() => setFullScreenImage(null)}>
          <img src={fullScreenImage} alt="Full screen" />
          <button className="close-button" onClick={() => setFullScreenImage(null)}>X</button>
        </div>
      )}
    </div>
  );
};

export default Chat;