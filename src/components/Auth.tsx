import React, { useState } from "react";
import { auth, googleProvider } from "../config/firebase";
import { createUserWithEmailAndPassword, signOut, signInWithPopup } from "firebase/auth";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInWithGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        console.log("Done")
        setEmail("");
        setPassword("");
    } catch (error) {
        console.error(error)
    }
  }

  const signIn: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
    }
  };


  const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error(error);
    }
  }

  return (
    <form onSubmit={signIn}>
      <input
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button>Sign in</button>

      <button type="button" onClick={signInWithGoogle}>
        Sign In with Google
      </button>
      <button type="button" onClick={logout}>Log out</button>
    </form>
  );
};

export { Auth };
