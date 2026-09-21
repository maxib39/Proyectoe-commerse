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
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);

    // Escuchar cambios de sesión
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const userRef = doc(db, "users", currentUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        setUserData(userSnap.data());
                    } else {
                        const defaultData = {
                            displayName: currentUser.displayName || "Usuario",
                            email: currentUser.email,
                            role: "user",
                            createdAt: new Date().toISOString()
                        };
                        await setDoc(userRef, defaultData);
                        setUserData(defaultData);
                    }
                } catch (error) {
                    console.error("Error al obtener datos de Firestore:", error);
                }
            } else {
                setUserData(null);
                setIsUserDrawerOpen(false); // Cierra el drawer si el usuario deja de estar autenticado
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Registro con Email
    const registerWithEmail = async (email, password, displayName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

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

    // Cerrar sesión limpiando el estado del drawer
    const logout = async () => {
        setIsDrawerOpen(false);
        return signOut(auth);
    };

    const openUserDrawer = () => setIsUserDrawerOpen(true);
    const closeUserDrawer = () => setIsUserDrawerOpen(false);

    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                loading,
                isAdmin: userData?.role === "admin",
                isUserDrawerOpen,
                setIsUserDrawerOpen,
                openUserDrawer,
                closeUserDrawer,
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