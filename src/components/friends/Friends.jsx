import React, { useEffect, useState } from 'react';
import './friends.css'; // Import the CSS file
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
    <div className="w-[800px] bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`px-4 py-2 mr-4 font-semibold hover:text-blue-400 transition-colors duration-200 border-b-2 ${
            activeTab === 'friends' ? 'border-blue-500' : 'border-transparent'
          } focus:outline-none`}
          onClick={() => setActiveTab('friends')}
        >
          Friends
        </button>
        <button
          className={`px-4 py-2 mr-4 font-semibold hover:text-blue-400 transition-colors duration-200 border-b-2 ${
            activeTab === 'add' ? 'border-blue-500' : 'border-transparent'
          } focus:outline-none`}
          onClick={() => setActiveTab('add')}
        >
          Add Friends
        </button>
        <button
          className={`px-4 py-2 font-semibold hover:text-blue-400 transition-colors duration-200 border-b-2 ${
            activeTab === 'requests' ? 'border-blue-500' : 'border-transparent'
          } focus:outline-none`}
          onClick={() => setActiveTab('requests')}
        >
          Requests
        </button>
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Your Friends</h2>
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="bg-gray-800 p-4 rounded-lg flex items-center transition-all duration-300 hover:bg-gray-700 hover:shadow-md cursor-pointer"
            >
              <img
                src={friend.profileURL}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <h3 className="font-semibold">{friend.username}</h3>
                <p className="text-gray-400 text-sm">Online</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Friends Tab */}
      {activeTab === 'add' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Add Friends</h2>
          <div className="flex mb-6">
            <input
              type="text"
              placeholder="Search users..."
              className="bg-gray-800 text-white px-4 py-2 rounded-l-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setText(e.target.value)}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg transition-colors duration-200"
              onClick={searchUser}
            >
              Search
            </button>
          </div>
          {userData && (
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between transition-all duration-300 hover:bg-gray-700 hover:shadow-md">
              <div className="flex items-center">
                <img
                  src={userData.profileURL || "./profile.png"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-semibold">{userData.username}</h3>
                  <p className="text-gray-400 text-sm">Suggested Friend</p>
                </div>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none"
                onClick={addFriend}
              >
                Add Friend
              </button>
            </div>
          )}
        </div>
      )}

      {/* Friend Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-gray-800 p-4 rounded-lg flex items-center justify-between transition-all duration-300 hover:bg-gray-700 hover:shadow-md"
            >
              <div className="flex items-center">
                <img
                  src={req.profileURL || "./profile.png"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-semibold">{req.senderName}</h3>
                  <p className="text-gray-400 text-sm">Sent 2 days ago</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none"
                  onClick={() => acceptRequest(req.id)}
                >
                  Accept
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Friends;
