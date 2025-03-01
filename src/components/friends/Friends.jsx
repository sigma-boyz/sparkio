import React, { useEffect, useState } from 'react';
import './friends.css';
import { arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../backend/firebase';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [text, setText] = useState("");
  const [userData, setUserData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  const addFriend = async () => {
    const uid = auth.currentUser.uid < userData.id 
      ? `${auth.currentUser.uid}_${userData.id}` 
      : `${userData.id}_${auth.currentUser.uid}`;

    await setDoc(doc(db, "friendRequests", uid), {
      sender: auth.currentUser.uid,
      receiver: userData.id,
      profileURL: userData.profileURL || "./profile.png",
      id: uid
    });

    setUserData(null);
  };

  const acceptRequest = async (uid) => {
    const [uid1, uid2] = uid.split("_");
    await updateDoc(doc(db, "users", uid1), {
      friends: arrayUnion(uid2)
    });
    await updateDoc(doc(db, "users", uid2), {
      friends: arrayUnion(uid1)
    });

    await setDoc(doc(db, "chats", uid), {
      id: uid,
      users: uid.split("_"),
      [`lastmsg_${uid1}`]: "",
      [`lastmsg_${uid2}`]: "",
      lastMessageTimestamp: serverTimestamp()
    });
    await deleteDoc(doc(db, "friendRequests", uid));
    setRequests(prevRequests => prevRequests.filter(request => request.id !== uid));
  };

  const searchUser = async () => {
    setUserData(null);
    if (text === "") return;

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", text));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setUserData(userDoc.data());
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error getting user UID:", error);
    }
  };

  useEffect(() => {
    const fetchRequestsAndFriends = async () => {
      const requestRef = collection(db, "friendRequests");
      const q = query(requestRef, where("receiver", "==", auth.currentUser.uid));
      try {
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const requestList = await Promise.all(snapshot.docs.map(async (Doc) => {
            const requestData = Doc.data();
            const senderRef = doc(db, "users", requestData.sender);
            const senderSnap = await getDoc(senderRef);
            if (!senderSnap.empty) {
              const senderData = senderSnap.data();
              return {
                id: requestData.id,
                profileURL: senderData.profileURL,
                senderName: senderData.username
              };
            }
            return null;
          }));

          setRequests(requestList.filter(req => req !== null)); 
        }

        // Fetch user's friends' data
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userFriends = userDocSnapshot.data().friends || [];
          const friendsList = await Promise.all(userFriends.map(async (friendId) => {
            const friendRef = doc(db, "users", friendId);
            const friendSnap = await getDoc(friendRef);
            if (friendSnap.exists()) {
              return {
                id: friendSnap.id,
                username: friendSnap.data().username,
                profileURL: friendSnap.data().profileURL || "./profile.png"
              };
            }
            return null;
          }));

          setFriends(friendsList.filter(friend => friend !== null));
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchRequestsAndFriends();
  }, []);

  return (
    <div className="friends-container">
      <nav className="tabs">
        <button
          className={activeTab === 'friends' ? 'active' : ''}
          onClick={() => setActiveTab('friends')}
        >
          Friends List
        </button>
        <button
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => setActiveTab('add')}
        >
          Add Friend
        </button>
        <button
          className={activeTab === 'requests' ? 'active' : ''}
          onClick={() => setActiveTab('requests')}
        >
          Requests
        </button>
      </nav>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          {friends.map((friend) => (
            <UserItem
              key={friend.id}
              username={friend.username}
              profilePic={friend.profileURL}
            />
          ))}
        </div>
      )}

      {/* Add Friends Tab */}
      {activeTab === 'add' && (
        <div className="space-y-4">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search users..."
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={searchUser}>Search</button>
          </div>
          {userData && (
            <UserItem
              username={userData.username}
              profilePic={userData.profileURL || "./profile.png"}
              buttonText="Add Friend"
              addFriend={addFriend}
            />
          )}
        </div>
      )}

      {/* Friend Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.map((req) => (
            <UserItem
              key={req.id}
              username={req.senderName}
              profilePic={req.profileURL || "./profile.png"}
              isRequest
              uid={req.id}
              acceptRequest={acceptRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const UserItem = ({ username, profilePic, buttonText, isRequest, addFriend, uid, acceptRequest }) => {
  return (
    <div className="user-item">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={profilePic} alt="Profile" />
          <h3>{username}</h3>
        </div>
        {buttonText && (
          <button className="add-friend" onClick={addFriend}>
            {buttonText}
          </button>
        )}
        {isRequest && (
          <div className="flex gap-2">
            <button className="accept" onClick={() => acceptRequest(uid)}>
              Accept
            </button>
            <button className="reject">
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
