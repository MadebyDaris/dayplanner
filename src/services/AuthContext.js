import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';

import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    serverTimestamp,
    deleteDoc
} from 'firebase/firestore';

import {
    auth,
    db
} from './firebase';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({
    children
}) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userTeams, setUserTeams] = useState([]);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [error, setError] = useState('');

    const createFireStoreUserProfile = async (user, additionalData = {}) => {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || additionalData.displayName || '',
                    photoURL: user.photoURL || '',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    ...additionalData
                };

                await setDoc(userRef, userData);
                return userData;
            }
            return userSnap.data();
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }

    const getUserTeams = async (userId) => {
        try {
            const teamsQuery = query(
                collection(db, 'teamMemberships'),
                where('userId', '==', userId),
                where('isActive', '==', true)
            );

            const querySnapshot = await getDocs(teamsQuery);
            const teamMemberships = [];

            for (const doc of querySnapshot.docs) {
                const membership = doc.data();

                // Get team details
                const teamDoc = await getDoc(doc(db, 'teams', membership.teamId));
                if (teamDoc.exists()) {
                    teamMemberships.push({
                        ...membership,
                        team: {
                            id: teamDoc.id,
                            ...teamDoc.data()
                        }
                    });
                }
            }

            return teamMemberships;
        } catch (error) {
            console.error('Error fetching user teams:', error);
            return [];
        }
    };

    const createTeam = async (teamData, userId) => {
        try {
            // Create team document
            const teamRef = await addDoc(collection(db, 'teams'), {
                name: teamData.name,
                description: teamData.description || '',
                color: teamData.color || '#3b82f6',
                createdBy: userId,
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Add creator as team owner
            await addDoc(collection(db, 'teamMemberships'), {
                userId: userId,
                teamId: teamRef.id,
                role: 'owner',
                isActive: true,
                joinedAt: serverTimestamp()
            });

            return teamRef.id;
        } catch (error) {
            console.error('Error creating team:', error);
            throw error;
        }
    };

    const joinTeam = async (teamId, userId, role = 'member') => {
        try {
            await addDoc(collection(db, 'teamMemberships'), {
                userId: userId,
                teamId: teamId,
                role: role,
                isActive: true,
                joinedAt: serverTimestamp()
            });

            const teams = await getUserTeams(userId);
            setUserTeams(teams);

            return true;
        } catch (error) {
            console.error('Error joining team:', error);
            throw error;
        }
    };

    const leaveTeam = async (teamId, userId) => {
        try {
            const membershipQuery = query(
                collection(db, 'teamMemberships'),
                where('teamId', '==', teamId),
                where('userId', '==', userId)
            );

            const querySnapshot = await getDocs(membershipQuery);
            if (!querySnapshot.empty) {
                const membershipDoc = querySnapshot.docs[0];
                await deleteDoc(membershipDoc.ref);

                const teams = await getUserTeams(userId);
                setUserTeams(teams);

                if (currentTeam?.id === teamId) {
                    if (teams.length > 0) {
                        switchTeam(teams[0].team);
                    } else {
                        setCurrentTeam(null);
                        localStorage.removeItem('currentTeamId');
                    }
                }
            }
        } catch (error) {
            console.error('Error leaving team:', error);
            throw error;
        }
    };

    const signUp = async (email, password, displayName, teamData = null) => {
        try {
            setError('');
            const result = await createUserWithEmailAndPassword(auth, email, password);

            if (displayName && result.user) {
                await updateProfile(result.user, {
                    displayName: displayName
                });
            }

            const profileData = await createFireStoreUserProfile(result.user, {
                displayName
            });
            setUserProfile(profileData);

            if (teamData) {
                if (teamData.create) {
                    await createTeam({
                        name: teamData.name,
                        description: teamData.description,
                        color: teamData.color
                    }, result.user.uid);
                } else if (teamData.join && teamData.teamId) {
                    await joinTeam(teamData.teamId, result.user.uid);
                }
            }

            return result;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const signIn = async (email, password) => {
        try {
            setError('');
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            setError('');
            const provider = new GoogleAuthProvider();
            return await signInWithPopup(auth, provider);
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setError('');
            setUserProfile(null);
            setUserTeams([]);
            setCurrentTeam(null);
            return await signOut(auth);
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const switchTeam = (team) => {
        setCurrentTeam(team);
        localStorage.setItem('currentTeamId', team.id);
    };

    const resetPassword = async (email) => {
        try {
            setError('');
            return await sendPasswordResetEmail(auth, email);
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setUserProfile(userSnap.data());
                    } else {
                        const profileData = await createFireStoreUserProfile(user);
                        setUserProfile(profileData);
                    }

                    const teams = await getUserTeams(user.uid);
                    setUserTeams(teams);

                    const savedTeamId = localStorage.getItem('currentTeamId');
                    const savedTeam = teams.find(t => t.team.id === savedTeamId);

                    if (savedTeam) {
                        setCurrentTeam(savedTeam.team);
                    } else if (teams.length > 0) {
                        setCurrentTeam(teams[0].team);
                        localStorage.setItem('currentTeamId', teams[0].team.id);
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                }
            } else {
                setUserProfile(null);
                setUserTeams([]);
                setCurrentTeam(null);
                localStorage.removeItem('currentTeamId');
            }
            setUser(user);
            setLoading(false);
        });
        return unsubscribe
    }, []); // Empty dependency array ensures this runs once on mount

    const value = {
        user,
        userProfile,
        userTeams,
        currentTeam,
        signUp,
        signIn,
        signInWithGoogle,
        logout,
        resetPassword,
        createTeam,
        joinTeam,
        switchTeam,
        leaveTeam,
        loading,
        error,
        setError
    };

    return ( 
      <AuthContext.Provider value = {value}> 
      {!loading && children} 
      </AuthContext.Provider>
    );
};