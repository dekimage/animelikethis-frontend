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
import { IoMdReturnLeft } from "react-icons/io";

const DEFAULT_USER = {
  level: 1,
  streak: 0,
  xp: 0,
};

const logger = new Logger({ debugEnabled: false }); // switch to true to see console logs from firebase

class Store {
  // App Data

  user = null;
  blogs = [];
  blog = {
    anime: "",
    malId: "",
    comparisons: [{ anime: "", malId: "", differences: "", similarities: "" }],
  };
  loading = true;
  isEditing = false;

  // Static Data

  // App States
  isMobileOpen = false;

  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();

    this.setIsMobileOpen = this.setIsMobileOpen.bind(this);

    this.upgradeAccount = this.upgradeAccount.bind(this);
    this.loginWithEmail = this.loginWithEmail.bind(this);
    this.signupWithEmail = this.signupWithEmail.bind(this);

    this.fetchAnime = this.fetchAnime.bind(this);

    this.updateUser = this.updateUser.bind(this);
    this.fetchBlogs = this.fetchBlogs.bind(this);
    this.saveBlog = this.saveBlog.bind(this);
    this.deleteBlog = this.deleteBlog.bind(this);
    this.setBlog = this.setBlog.bind(this);
    this.resetBlog = this.resetBlog.bind(this);
    this.addComparison = this.addComparison.bind(this);
    this.removeComparison = this.removeComparison.bind(this);
    this.updateComparison = this.updateComparison.bind(this);
    this.updateBlogField = this.updateBlogField.bind(this);
  }

  initializeAuth() {
    const auth = getAuth();
    this.fetchBlogs();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        runInAction(() => {
          if (!userDoc.exists()) {
            IoMdReturnLeft;
          }
          this.user = { uid: user.uid, ...userDoc.data() };
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

  async fetchAnime(id) {
    try {
      const response = await axios.get(
        `https://api.myanimelist.net/v2/anime/${id}`,
        {
          headers: {
            Authorization: `Bearer YOUR_TOKEN`, // Replace YOUR_TOKEN with your actual token
          },
        }
      );

      runInAction(() => {
        this.fetchedAnimes.push(response.data.data);
        this.currentAnime = response.data.data;
      });
    } catch (error) {
      console.error("Error fetching anime details:", error);
      runInAction(() => {
        this.animeDetails = {};
      });
    }
  }

  async fetchBlogs() {
    try {
      const blogsRef = collection(db, "blogs");
      const querySnapshot = await getDocs(blogsRef);

      runInAction(() => {
        this.blogs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });

      logger.debug("Blogs fetched successfully");
    } catch (error) {
      logger.debug("Error fetching blogs:", error);
    }
  }

  //CMS
  async fetchBlogs() {
    this.loading = true;
    try {
      const querySnapshot = await getDocs(collection(db, "blogs"));
      const blogs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      runInAction(() => {
        this.blogs = blogs;
        this.loading = false;
      });
    } catch (error) {
      console.error("Error fetching blogs:", error);
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async saveBlog(blog) {
    try {
      if (blog.id) {
        const blogRef = doc(db, "blogs", blog.id);
        await updateDoc(blogRef, blog);
      } else {
        await addDoc(collection(db, "blogs"), blog);
      }
      this.fetchBlogs();
      this.setEditing(false);
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  }

  async deleteBlog(id) {
    try {
      await deleteDoc(doc(db, "blogs", id));
      this.fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  }

  setBlog(blog) {
    this.blog = {
      ...blog,
      comparisons:
        blog.comparisons && blog.comparisons.length > 0
          ? blog.comparisons
          : [{ anime: "", malId: "", differences: "", similarities: "" }],
    };
  }

  resetBlog() {
    this.blog = {
      anime: "",
      malId: "",
      comparisons: [
        { anime: "", malId: "", differences: "", similarities: "" },
      ],
    };
  }

  addComparison() {
    this.blog.comparisons.push({
      anime: "",
      malId: "",
      differences: "",
      similarities: "",
    });
  }

  removeComparison(index) {
    this.blog.comparisons.splice(index, 1);
  }

  updateComparison(index, field, value) {
    this.blog.comparisons[index][field] = value;
  }

  updateBlogField(field, value) {
    this.blog[field] = value;
  }

  setEditing(value) {
    this.isEditing = value;
  }

  // GLOBAL MOBX STATE
  setIsMobileOpen(isMobileOpen) {
    runInAction(() => {
      this.isMobileOpen = isMobileOpen;
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
