import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);

    if (!isOpen) return null;

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box relative">
                <button
                    className="btn btn-sm btn-circle absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>

                {isLogin ? (
                    <Login onToggleForm={toggleForm} onClose={onClose} />
                ) : (
                    <Register onToggleForm={toggleForm} onClose={onClose} />
                )}
            </div>
        </div>
    );
};

export default AuthModal;