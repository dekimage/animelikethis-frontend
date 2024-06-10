import { makeAutoObservable, runInAction } from "mobx";
import { auth, db, storage } from "./firebase";
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
  startAfter,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import axios from "axios";
import slugify from "slugify";

import Logger from "@/utils/logger";

const DEFAULT_USER = {
  level: 1,
  streak: 0,
  xp: 0,
};

const logger = new Logger({ debugEnabled: false }); // switch to true to see console logs from firebase

class Store {
  // App Data
  blogsListLoading = false;
  homeBlogs = [];
  listsBlogs = [];
  lastVisibleBlog = null;
  user = null;
  blogs = [];
  nextPageToken = null;
  // blog = {
  //   anime: "",
  //   malId: "",
  //   comparisons: [{ anime: "", malId: "", differences: "", similarities: "" }],
  // };
  blog = {
    title: "",
    malId: "",
    anime: "",
    type: "comparisons",
    comparisons: [
      {
        anime: "",
        malId: "",
        differences: "",
        similarities: "",
        content: "",
      },
    ],
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

    this.generateExcerpt = this.generateExcerpt.bind(this);
    this.updateDocuments = this.updateDocuments.bind(this);
    this.fetchBlogById = this.fetchBlogById.bind(this);
    this.fetchListsBlogs = this.fetchListsBlogs.bind(this);
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
    this.fetchListsBlogs();
  }

  //script to enhance database with slugs and tags
  generateExcerpt = (text, length = 150) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  async updateDocuments() {
    try {
      const blogsCollectionRef = collection(db, "blogs");
      const blogsSnapshot = await getDocs(blogsCollectionRef);

      const updatePromises = blogsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        if (!data.slug) {
          const anime = data.anime || "Default Anime Title"; // Assuming 'anime' is the title field

          const slug = `anime-like-${slugify(anime, {
            lower: true,
            strict: true,
          })}`;

          const excerpt =
            data.comparisons && data.comparisons.length > 0
              ? this.generateExcerpt(data.comparisons[0].differences)
              : "Default excerpt";

          const image = data.image || "default-image-url.jpg"; // Replace with logic to derive image URL

          await updateDoc(doc.ref, {
            slug,
            // title: anime,
            excerpt,
            // image,
          });
          console.log(`Updated document ${doc.id} with slug: ${slug}`);
        } else {
          console.log(`Document ${doc.id} already has a slug. Skipping.`);
        }
      });

      await Promise.all(updatePromises);
      console.log("All documents have been processed.");
    } catch (error) {
      console.error("Error updating documents:", error);
    }
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
  async fetchListsBlogs() {
    this.blogsListLoading = true;
    try {
      const blogsRef = collection(db, "blogs");
      const q = query(blogsRef, where("type", "==", "list"), limit(10));
      const blogsSnapshot = await getDocs(q);

      const blogs = blogsSnapshot.docs.map((snapshot) => ({
        id: snapshot.id,
        ...snapshot.data(),
      }));

      runInAction(() => {
        this.listsBlogs = blogs;
        this.blogsListLoading = false;
      });

      // console.log("Fetched blogs:", this.listsBlogs);
    } catch (error) {
      runInAction(() => {
        this.blogsListLoading = false;
      });
      console.error("Error fetching list blogs:", error);
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
    if (!this.lastVisibleBlog || this.blogsLoading) return; // Don't fetch if there's no next page or already loading
    console.log(123, this.lastVisibleBlog);
    this.blogsLoading = true;
    try {
      const blogsRef = collection(db, "blogs");
      const q = query(
        blogsRef,
        orderBy("malId"),
        startAfter(this.lastVisibleBlog), // Use the last visible document to start the next query
        limit(10)
      );
      console.log({ q });
      const blogsSnapshot = await getDocs(q);
      console.log({ blogsSnapshot });

      const fetchedBlogs = await Promise.all(
        blogsSnapshot.docs.map(async (snapshot) => {
          const blog = { id: snapshot.id, ...snapshot.data() };

          // Fetch anime details for each blog
          const animeRef = doc(db, "animes", blog.malId.toString());
          const animeDoc = await getDoc(animeRef);
          if (animeDoc.exists()) {
            blog.animeDetails = { id: animeDoc.id, ...animeDoc.data() };
          }

          return blog;
        })
      );

      runInAction(() => {
        this.lastVisibleBlog =
          blogsSnapshot.docs[blogsSnapshot.docs.length - 1]; // Update the last visible document
        this.nextPageToken =
          blogsSnapshot.docs.length > 0
            ? blogsSnapshot.docs[blogsSnapshot.docs.length - 1].id
            : null;
        this.homeBlogs.push(...fetchedBlogs); // Append new blogs to the existing list
        this.blogsLoading = false;
      });
    } catch (error) {
      console.log({ error });
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

  async uploadImage(file) {
    if (!file) return null;

    try {
      const storageRef = ref(storage, `images/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  }

  async fetchBlogById(id) {
    try {
      const blogRef = doc(db, "blogs", id);
      const blogDoc = await getDoc(blogRef);
      if (blogDoc.exists()) {
        const blog = { id: blogDoc.id, ...blogDoc.data() };
        runInAction(() => {
          const index = this.blogs.findIndex((b) => b.id === id);
          if (index !== -1) {
            this.blogs[index] = blog;
          } else {
            this.blogs.push(blog);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching blog by ID:", error);
    }
  }

  async saveBlog(blog, file) {
    try {
      let imageUrl = blog.image || "";

      if (file) {
        imageUrl = await this.uploadImage(file);
        if (!imageUrl) {
          console.log("Failed to upload image");
        }
      }

      const updatedBlog = { ...blog, image: imageUrl };

      if (updatedBlog.id) {
        const blogRef = doc(db, "blogs", updatedBlog.id);
        await updateDoc(blogRef, updatedBlog);
      } else {
        const blogRef = await addDoc(collection(db, "blogs"), updatedBlog);
        updatedBlog.id = blogRef.id;
      }

      await this.fetchBlogById(updatedBlog.id);
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
    const newComparison =
      this.blog.type === "comparisons"
        ? { anime: "", malId: "", differences: "", similarities: "" }
        : { anime: "", malId: "", content: "" };
    this.blog.comparisons.push(newComparison);
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
