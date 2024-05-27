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

import axios from "axios";

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
  homeBlogs = [];
  lastVisibleBlog = null;
  user = null;
  blogs = [];
  nextPageToken = null;
  blog = {
    anime: "",
    malId: "",
    comparisons: [{ anime: "", malId: "", differences: "", similarities: "" }],
  };
  blogsLoading = true;
  loading = true;
  isEditing = false;
  comparisonDetails = [];

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

    this.fetchBlogsHome = this.fetchBlogsHome.bind(this);
    this.fetchMoreBlogs = this.fetchMoreBlogs.bind(this);
  }

  async initializeAuth() {
    // const auth = getAuth();
    // this.fetchBlogs();
    // onAuthStateChanged(auth, async (user) => {
    //   if (user) {
    //     const userDocRef = doc(db, "users", user.uid);
    //     const userDoc = await getDoc(userDocRef);
    //     runInAction(() => {
    //       if (!userDoc.exists()) {
    //         IoMdReturnLeft;
    //       }
    //       this.user = { uid: user.uid, ...userDoc.data() };
    //     });
    //   } else {
    //     runInAction(() => {
    //       this.user = null;
    //     });
    //   }
    //   runInAction(() => {
    //     this.loading = false;
    //   });
    // });
  }

  async findMissingMalIds() {
    try {
      const blogsSnapshot = await getDocs(collection(db, "blogs"));
      const malIds = new Set();

      // Extract malIds from blogs
      blogsSnapshot.forEach((doc) => {
        const blog = doc.data();
        malIds.add(blog.malId);
        if (blog.comparisons && Array.isArray(blog.comparisons)) {
          blog.comparisons.forEach((comparison) => {
            malIds.add(comparison.malId);
          });
        }
      });

      const uniqueMalIds = Array.from(malIds);
      console.log(`Extracted ${uniqueMalIds.length} unique MAL IDs`);

      // Fetch all documents in animes collection
      const animesSnapshot = await getDocs(collection(db, "animes"));
      const existingAnimeIds = new Set(
        animesSnapshot.docs.map((doc) => doc.id)
      );

      // Find malIds not present in animes collection
      const missingMalIds = uniqueMalIds.filter(
        (malId) => !existingAnimeIds.has(malId.toString())
      );
      console.log(`Missing MAL IDs: ${missingMalIds.length}`);

      return missingMalIds.map((malId) => malId.toString());
    } catch (error) {
      console.error("Error finding missing MAL IDs:", error);
      return [];
    }
  }

  async addBlogsBulk(blogs) {
    try {
      const blogsCollectionRef = collection(db, "blogs");
      const savedBlogIds = [];

      const promises = blogs.map(async (blog, index) => {
        try {
          const docRef = await addDoc(blogsCollectionRef, blog);
          console.log(`Blog ${index + 1} added with ID: ${docRef.id}`);
          savedBlogIds.push(docRef.id);
        } catch (error) {
          console.error(`Error adding blog ${index + 1}:`, error);
        }
      });

      await Promise.all(promises);

      runInAction(() => {
        console.log("All blogs have been processed.");
      });

      return savedBlogIds;
    } catch (error) {
      console.error("Error adding blogs to Firestore:", error);
      return [];
    }
  }

  async extractMalIds() {
    try {
      const blogsSnapshot = await getDocs(collection(db, "blogs"));
      const malIds = new Set(); // Using a Set to ensure unique IDs

      // Extract malIds from blogs
      blogsSnapshot.forEach((doc) => {
        const blog = doc.data();
        malIds.add(blog.malId);
        if (blog.comparisons && Array.isArray(blog.comparisons)) {
          blog.comparisons.forEach((comparison) => {
            malIds.add(comparison.malId);
          });
        }
      });

      // Convert Set to Array
      const malIdArray = Array.from(malIds);
      console.log(`Extracted ${malIdArray.length} unique MAL IDs`);
      console.log({ malIdArray });
      return malIdArray;
    } catch (error) {
      console.error("Error extracting MAL IDs:", error);
      return [];
    }
  }

  async fetchAndSaveAnimeDetails(malIds) {
    try {
      // Fetch anime details for each malId from your Next.js API
      const promises = malIds.map(async (malId) => {
        const response = await fetch(`/api/anime/${malId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      });

      const animeDetailsArray = await Promise.all(promises);

      console.log({ animeDetailsArray });

      // Save each anime detail to the 'animes' collection
      for (const animeDetails of animeDetailsArray) {
        if (animeDetails) {
          const animeRef = doc(
            collection(db, "animes"),
            animeDetails.id.toString()
          );
          await setDoc(animeRef, animeDetails);
        }
      }
      console.log("Successfully saved all anime details to Firestore");
    } catch (error) {
      console.error("Error fetching or saving anime details:", error);
    }
  }

  async fetchBlogAndAnimeDetails(blogId) {
    console.log("Fetching blog and anime details for blog ID:", blogId);
    try {
      // Fetch the blog document
      const blogRef = doc(db, "blogs", blogId);
      const blogDoc = await getDoc(blogRef);
      console.log("Fetched blog document:", blogDoc);

      if (!blogDoc.exists()) {
        console.log("Blog document does not exist.");
        return null;
      }

      const blogData = { id: blogDoc.id, ...blogDoc.data() };
      const malIds = new Set();

      // Collect main malId and malIds from comparisons
      malIds.add(blogData.malId.toString());
      if (blogData.comparisons && Array.isArray(blogData.comparisons)) {
        blogData.comparisons.forEach((comparison) => {
          malIds.add(comparison.malId.toString());
        });
      }

      console.log("Collected malIds:", malIds);

      // Fetch the anime details for each malId
      const animeDetailsPromises = Array.from(malIds).map(async (malId) => {
        try {
          const animeRef = doc(db, "animes", malId);
          const animeDoc = await getDoc(animeRef);
          console.log(`Fetched anime document for malId ${malId}:`, animeDoc);

          return animeDoc.exists()
            ? { id: animeDoc.id, ...animeDoc.data() }
            : null;
        } catch (animeError) {
          console.error(
            `Error fetching anime document for malId ${malId}:`,
            animeError
          );
          return null;
        }
      });

      const animeDetailsArray = await Promise.all(animeDetailsPromises);
      const animeDetails = animeDetailsArray.filter(
        (details) => details !== null
      );

      console.log("Fetched anime details array:", animeDetails);

      // Create a map of malId to animeDetails for easy lookup
      const animeDetailsMap = {};
      animeDetails.forEach((detail) => {
        animeDetailsMap[detail.id] = detail;
      });

      console.log("Mapped anime details:", animeDetailsMap);

      // Attach anime details to main blog data
      blogData.animeDetails = animeDetailsMap[blogData.malId.toString()];

      // Attach anime details to each comparison
      if (blogData.comparisons && Array.isArray(blogData.comparisons)) {
        blogData.comparisons = blogData.comparisons.map((comparison) => {
          return {
            ...comparison,
            animeDetails: animeDetailsMap[comparison.malId.toString()],
          };
        });
      }

      console.log("Final blog data with anime details:", blogData);
      return blogData;
    } catch (error) {
      console.error("Error fetching blog and anime details:", error);
      return null;
    }
  }

  async fetchBlogsHome() {
    this.blogsLoading = true;
    try {
      const blogsRef = collection(db, "blogs");
      const q = query(blogsRef, orderBy("malId"), limit(10));
      const blogsSnapshot = await getDocs(q);

      const blogs = await Promise.all(
        blogsSnapshot.docs.map(async (snapshot) => {
          try {
            const blog = { id: snapshot.id, ...snapshot.data() };
            console.log({ MALID: blog.malId });
            // Test log inside Promise.all
            const animeRef = doc(db, "animes", blog.malId.toString());
            const animeDoc = await getDoc(animeRef);

            if (animeDoc.exists()) {
              blog.animeDetails = { id: animeDoc.id, ...animeDoc.data() };
            }
            return blog;
          } catch (error) {
            console.log("Error processing blog:", doc.id, error);
            return null;
          }
        })
      );

      runInAction(() => {
        this.nextPageToken =
          blogsSnapshot.docs.length > 0
            ? blogsSnapshot.docs[blogsSnapshot.docs.length - 1].id // Store the last document ID
            : null;
        this.lastVisibleBlog =
          blogsSnapshot.docs[blogsSnapshot.docs.length - 1];
        this.homeBlogs = blogs.filter((blog) => blog !== null);
        this.blogsLoading = false;
      });

      // console.log("Fetched blogs with anime details:", this.homeBlogs);
    } catch (error) {
      runInAction(() => {
        this.blogsLoading = false;
      });
      console.error("Error fetching blogs:", error);
    }
  }

  async fetchMoreBlogs() {
    if (!this.nextPageToken || this.blogsLoading) return; // Don't fetch if there's no next page or already loading

    this.blogsLoading = true;
    try {
      const blogsRef = collection(db, "blogs");
      const q = query(
        blogsRef,
        orderBy("malId"),
        // startAfter(this.nextPageToken),
        limit(10)
      );
      console.log({ q });
      const blogsSnapshot = await getDocs(q);
      const fetchedBlogs = [];

      for (const snapshot of blogsSnapshot.docs) {
        const blog = { id: snapshot.id, ...snapshot.data() };
        // ... (fetch anime details for each blog) ...
        fetchedBlogs.push(blog);
      }

      runInAction(() => {
        this.nextPageToken =
          blogsSnapshot.docs.length > 0
            ? blogsSnapshot.docs[blogsSnapshot.docs.length - 1].id
            : null;
        this.homeBlogs.push(...fetchedBlogs);
        this.blogsLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.blogsLoading = false;
      });
      console.error("Error fetching more blogs:", error);
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
        this.blogsLoading = false;
      });
    } catch (error) {
      console.error("Error fetching blogs:", error);
      runInAction(() => {
        this.blogsLoading = false;
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
