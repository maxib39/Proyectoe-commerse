"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // Datos adicionales (rol, nombre, etc.)
    const [loading, setLoading] = useState(true);

    // Escuchar cambios de sesión
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Buscar o crear perfil en Firestore
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserData(userSnap.data());
                } else {
                    // Si entra con Google por primera vez, creamos su documento con rol "user"
                    const defaultData = {
                        displayName: currentUser.displayName || "Usuario",
                        email: currentUser.email,
                        role: "user",
                        createdAt: new Date().toISOString()
                    };
                    await setDoc(userRef, defaultData);
                    setUserData(defaultData);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Registro con Email
    const registerWithEmail = async (email, password, displayName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        // Guardar información en Firestore
        const userRef = doc(db, "users", newUser.uid);
        const profile = {
            displayName: displayName,
            email: email,
            role: "user",
            createdAt: new Date().toISOString()
        };
        await setDoc(userRef, profile);
        setUserData(profile);
        return newUser;
    };

    // Login con Email
    const loginWithEmail = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Login con Google
    const loginWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    // Reset de contraseña
    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    // Cerrar sesión
    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                loading,
                isAdmin: userData?.role === "admin",
                loginWithEmail,
                registerWithEmail,
                loginWithGoogle,
                resetPassword,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
