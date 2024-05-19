import { makeAutoObservable, runInAction } from "mobx";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signInAnonymously,
  getAuth,
  EmailAuthProvider,
  linkWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  onSnapshot,
  updateDoc,
  getDocs,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import Logger from "@/utils/logger";

const DEFAULT_USER = {
  level: 1,
  streak: 0,
  xp: 0,
};

const logger = new Logger({ debugEnabled: false }); // switch to true to see console logs from firebase

class Store {
  // App Data

  todos = [];
  user = null;

  // Static Data

  lists = [];
  // App States
  isMobileOpen = false;
  loading = true;

  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();

    this.setIsMobileOpen = this.setIsMobileOpen.bind(this);

    this.upgradeAccount = this.upgradeAccount.bind(this);
    this.loginWithEmail = this.loginWithEmail.bind(this);
    this.signupWithEmail = this.signupWithEmail.bind(this);

    // update this
    this.addExerciseToList = this.addExerciseToList.bind(this);
    this.removePathwayFromLists = this.removePathwayFromLists.bind(this);
    this.removeFromList = this.removeFromList.bind(this);

    this.addList = this.addList.bind(this);
    this.fetchLists = this.fetchLists.bind(this);
    this.deleteList = this.deleteList.bind(this);
    this.editListName = this.editListName.bind(this);

    this.updateUser = this.updateUser.bind(this);
  }

  initializeAuth() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        runInAction(() => {
          if (!userDoc.exists()) {
            const newUser = {
              ...DEFAULT_USER,
              uid: user.uid,
              provider: "anonymous",
              username: "Guest",
              createdAt: new Date(),
            };
            setDoc(userDocRef, newUser).then(() => {
              this.user = newUser;
            });
          } else {
            this.user = { uid: user.uid, ...userDoc.data() };
          }

          this.fetchLists();
        });
      } else {
        runInAction(() => {
          this.user = null;
        });
      }
      runInAction(() => {
        this.loading = false;
      });
    });
  }

  //
  //
  //
  //
  //
  // LISTS
  async fetchLists() {
    try {
      const userListsRef = collection(db, `users/${this.user.uid}/myLists`);
      const querySnapshot = await getDocs(userListsRef);

      runInAction(() => {
        this.lists = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });

      logger.debug("Lists fetched successfully");
    } catch (error) {
      logger.debug("Error fetching lists:", error);
    }
  }

  async addExerciseToList(listId, sessionId) {
    console.log({ listId, sessionId });
    try {
      // Reference to the specific user's list document in Firebase
      const listRef = doc(db, `users/${this.user.uid}/myLists`, listId);

      // Get the current list document
      const listDoc = await getDoc(listRef);
      if (!listDoc.exists()) {
        throw new Error("List not found");
      }

      const listData = listDoc.data();
      const updatedSessions = listData.sessions
        ? [...listData.sessions, sessionId]
        : [sessionId];

      // Update the list in Firebase
      await updateDoc(listRef, {
        sessions: updatedSessions,
      });

      // Update MobX store
      runInAction(() => {
        const list = this.lists.find((l) => l.id === listId);
        if (list) {
          list.sessions = updatedSessions;
        } else {
          // Handle the case where the list is not found in the store
        }
      });
    } catch (error) {
      console.error("Error adding pathway to list:", error);
      // Handle any errors appropriately
    }
  }

  async removeFromList(listId, pathwayId) {
    try {
      // Reference to the specific user's list document in Firebase
      const listRef = doc(db, `users/${this.user.uid}/myLists`, listId);

      // Get the current list document
      const listDoc = await getDoc(listRef);
      if (!listDoc.exists()) {
        throw new Error("List not found");
      }

      const listData = listDoc.data();
      const updatedPathways = listData.pathways.filter(
        (id) => id !== pathwayId
      );

      // Update the list in Firebase
      await updateDoc(listRef, {
        pathways: updatedPathways,
      });

      // Update MobX store
      runInAction(() => {
        const list = this.lists.find((l) => l.id === listId);
        if (list) {
          list.pathways = updatedPathways;
        } else {
          // Handle the case where the list is not found in the store
        }
      });
    } catch (error) {
      console.error("Error removing pathway from list:", error);
      // Handle any errors appropriately
    }
  }

  async addList(listName) {
    try {
      const userListsRef = collection(db, `users/${this.user.uid}/myLists`);

      const docRef = await addDoc(userListsRef, { name: listName });

      runInAction(() => {
        this.lists.push({
          id: docRef.id,

          name: listName,
        });
      });
    } catch (error) {
      console.error("Error adding list:", error);
      // Handle any errors appropriately
    }
  }

  async deleteList(listId) {
    try {
      const listRef = doc(db, `users/${this.user.uid}/myLists`, listId);
      await deleteDoc(listRef);

      runInAction(() => {
        this.lists = this.lists.filter((list) => list.id !== listId);
      });
    } catch (error) {
      console.error("Error deleting list:", error);
      // Handle any errors appropriately
    }
  }

  async editListName(listId, newName) {
    try {
      const listRef = doc(db, `users/${this.user.uid}/myLists`, listId);
      await updateDoc(listRef, { name: newName });

      runInAction(() => {
        const list = this.lists.find((l) => l.id === listId);
        if (list) {
          list.name = newName;
        } else {
          // Handle the case where the list is not found in the store
        }
      });
    } catch (error) {
      console.error("Error editing list name:", error);
      // Handle any errors appropriately
    }
  }

  // GLOBAL MOBX STATE
  setIsMobileOpen(isMobileOpen) {
    runInAction(() => {
      this.isMobileOpen = isMobileOpen;
    });
  }

  removePathwayFromListsInStore(pathwayId) {
    this.lists.forEach((list) => {
      const index = list.pathways.indexOf(pathwayId);
      if (index > -1) {
        list.pathways.splice(index, 1);
      }
    });
  }

  async removePathwayFromLists(pathwayId) {
    const listsRef = collection(db, `users/${this.user.uid}/myLists`);
    const q = query(listsRef, where("pathways", "array-contains", pathwayId));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      const listRef = doc.ref;
      await updateDoc(listRef, {
        pathways: firebase.firestore.FieldValue.arrayRemove(pathwayId),
      });
    });
    runInAction(() => {
      this.pathways = this.pathways.filter((p) => p.id !== pathwayId);
      this.recentPathways = this.recentPathways.filter(
        (p) => p.id !== pathwayId
      );
      this.topPlayedPathways = this.topPlayedPathways.filter(
        (p) => p.id !== pathwayId
      );
      this.userPathways = this.userPathways.filter((p) => p.id !== pathwayId);

      this.lists.forEach((list) => {
        list.pathways = list.pathways.filter((id) => id !== pathwayId);
      });
    });
  }

  async updateUser(newData) {
    try {
      const userDocRef = doc(db, "users", this.user.uid);
      await updateDoc(userDocRef, newData);
      runInAction(() => {
        this.user = { ...this.user, ...newData };
      });
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  //
  //
  //
  //
  //
  // AUTH FUNCTIONS
  async upgradeAccount(email, password, username) {
    try {
      const credential = EmailAuthProvider.credential(email, password);
      const userCredential = await linkWithCredential(
        auth.currentUser,
        credential
      );

      const userDocRef = doc(db, "users", userCredential.user.uid);
      await updateDoc(userDocRef, {
        username,
      });

      runInAction(() => {
        this.user = {
          ...userCredential.user,
          username,
        };
      });
    } catch (error) {
      console.error("Error upgrading account:", error);
    }
  }

  signInAnonymously = async () => {
    await signInAnonymously(auth);
    logger.debug("Signed in anonymously");
  };

  async loginWithEmail({ email, password }) {
    try {
      this.loading = true;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      runInAction(() => {
        this.user = userCredential.user;
        this.loading = false;
      });
    } catch (error) {
      console.error("Error logging in:", error);
      runInAction(() => {
        this.loading = false;
      });
      throw error;
    }
  }

  async signupWithEmail(email, password, username) {
    try {
      this.loading = true;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Additional user properties
      const newUserProfile = {
        ...DEFAULT_USER,
        createdAt: new Date(),
        username: username,
        email: email,
        uid: userCredential.user.uid,
      };

      // Create a user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), newUserProfile);

      runInAction(() => {
        this.user = newUserProfile;
        this.loading = false;
      });
    } catch (error) {
      console.error("Error signing up:", error);
      runInAction(() => {
        this.loading = false;
      });
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth); // Sign out from Firebase Authentication
      runInAction(() => {
        this.user = null; // Reset the user in the store
      });
    } catch (error) {
      console.error("Error during logout:", error);
      // Handle any errors that occur during logout
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newUserProfile = {
          ...DEFAULT_USER,
          createdAt: new Date(),
          username: user.displayName || "New User",
          email: user.email,
          uid: user.uid,
        };

        await setDoc(userDocRef, newUserProfile);

        runInAction(() => {
          this.user = newUserProfile;
        });
      } else {
        runInAction(() => {
          this.user = { uid: user.uid, ...userDoc.data() };
        });
      }
    } catch (error) {
      console.error("Error with Google sign-in:", error);
    }
  }

  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      // Handle success, such as showing a message to the user
    } catch (error) {
      console.error("Error sending password reset email:", error);
      // Handle errors, such as invalid email, etc.
    }
  }

  get isUserAnonymous() {
    return this.user && this.user.provider == "anonymous";
  }
}

const MobxStore = new Store();
export default MobxStore;
