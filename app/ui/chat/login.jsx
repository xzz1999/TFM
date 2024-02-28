
import React from 'react';
import './login.css';

export default function Login({ setCorreo }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Correo electrónico ingresado: ${e.target.correo.value}`);
        setCorreo(e.target.correo.value); 
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <label htmlFor="correo" className="form-label">Introduce tu Correo electrónico:</label>
                <input
                    id="correo"
                    name="correo"
                    type="email"
                    required
                    className="form-input"
                />
                <button type="submit" className="submit-button">Enviar</button>
            </form>
        </div>
    );
}
