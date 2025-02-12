import { useEffect, useState } from "react";
import { auth , db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 

export const fetchUserData = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);    
    const docSnapshot = await getDoc(userDocRef);    
    if (docSnapshot.exists()) {
      const userData = docSnapshot.data();
      return userData;
    } else {
      return null;
    }
  } catch (err) {
    console.log(err)
  }
};

export const userInfo = () => {
    const [user, setUser] = useState(null);
    const [IsLoading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsub(); 
    }, []);

    return { user, IsLoading };
};

