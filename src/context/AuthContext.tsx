import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User } from '../types';

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (userData: Partial<User>) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch additional user data from Firestore
                const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email!,
                        name: userData?.name || firebaseUser.displayName || '',
                        major: userData?.major,
                        graduationYear: userData?.graduationYear,
                        photoURL: firebaseUser.photoURL || undefined,
                        createdAt: userData?.createdAt?.toDate() || new Date(),
                    });
                } else {
                    // Fallback if Firestore document doesn't exist
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email!,
                        name: firebaseUser.displayName || '',
                        createdAt: new Date(),
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            await auth().signInWithEmailAndPassword(email, password);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign in');
        }
    };

    const signUp = async (email: string, password: string, userData: Partial<User>) => {
        try {
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            const { uid } = userCredential.user;

            // Update Firebase Auth profile
            await userCredential.user.updateProfile({
                displayName: userData.name,
            });

            // Store additional user data in Firestore
            await firestore().collection('users').doc(uid).set({
                name: userData.name,
                email: email,
                major: userData.major || '',
                graduationYear: userData.graduationYear || '',
                createdAt: firestore.FieldValue.serverTimestamp(),
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create account');
        }
    };

    const signOut = async () => {
        try {
            await auth().signOut();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign out');
        }
    };

    const updateUserProfile = async (userData: Partial<User>) => {
        if (!user) throw new Error('No user logged in');

        try {
            const currentUser = auth().currentUser;

            // Update Firebase Auth profile
            if (userData.name && currentUser) {
                await currentUser.updateProfile({
                    displayName: userData.name,
                });
            }

            // Update Firestore document
            await firestore().collection('users').doc(user.uid).update({
                ...userData,
                updatedAt: firestore.FieldValue.serverTimestamp(),
            });

            // Update local state
            setUser({ ...user, ...userData });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update profile');
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await auth().sendPasswordResetEmail(email);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to send reset email');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signIn,
                signUp,
                signOut,
                updateUserProfile,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

