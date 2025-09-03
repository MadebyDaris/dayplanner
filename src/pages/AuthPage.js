import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import '../styles/AuthPage.css';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [UserForm, setUserForm] = useState({
        email: '',
        password: '',
        displayName: ''
    });

    const [localLoading, setLocalLoading] = useState(false);
    const {
        signIn,
        signUp,
        signInWithGoogle,
        resetPassword,
        error,
        setError
    } = useAuth();

    const handleChange = (e) => {
        setUserForm({
            ...UserForm,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear errors when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalLoading(true);
        setError('');

        try {
            if (isLogin) {
                await signIn(UserForm.email, UserForm.password);
            } else {
                if (UserForm.password.length < 6) {
                    setError('Password should be at least 6 characters');
                    setLocalLoading(false);
                    return;
                }
                if (!UserForm.displayName.trim()) {
                    setError('Display name is required');
                    setLocalLoading(false);
                    return;
                }
                await signUp(UserForm.email, UserForm.password, UserForm.displayName.trim());
            }
        } catch (error) {
            console.error('Authentication error:', error);
        } finally {
            setLocalLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLocalLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Google sign-in error:', error);
        } finally {
            setLocalLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!UserForm.email) {
            setError('Please enter your email address first');
            return;
        }

        try {
            await resetPassword(UserForm.email);
            alert('Password reset email sent! Check your inbox.');
        } catch (error) {
            console.error('Password reset error:', error);
        }
    };

      return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title"> Day Planner </h1>
                        <p className="auth-subtitle"> {isLogin ? 'Welcome back!' : 'Join your team'}</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                        {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="auth-form">
                        {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="displayName">Full Name</label>
                            <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={UserForm.displayName}
                            onChange={handleChange}
                            required={!isLogin}
                            placeholder="Enter your full name"
                            />
                        </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={UserForm.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={UserForm.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                                minLength="6"
                            />
                        </div>

                        <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={localLoading}
                        >
                        {localLoading ? (
                            <span className="loading-spinner">⏳</span>
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                        </button>
                    </form>

                    <div className="auth-divider">
                <span>or</span>
            </div>

            <button
                onClick={handleGoogleSignIn}
                className="google-signin-btn"
                disabled={localLoading}>
            <span className="google-icon">🔍</span>
                Continue with Google
            </button>

            <div className="auth-links">
                {isLogin && (
                <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="auth-link-btn"
                    disabled={localLoading}
                >
                    Forgot Password?
                </button>
                )}

                <button
                type="button"
                onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setUserForm({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    displayName: ''
                    });
                }}
                className="auth-toggle-btn"
                disabled={localLoading}
                >
                {isLogin ? 
                    "Don't have an account? Sign up" : 
                    "Already have an account? Sign in"
                }
                </button>
            </div>
            </div>
        </div>
        </div>
  );
}
export default AuthPage;