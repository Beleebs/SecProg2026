// register
import { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [regError, setRegError] = useState('');
    const [regSuccess, setRegSuccess] = useState('');

    const nav = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');
        const registerCredentials = { email, password };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registerCredentials)
        }

        try {
            const response = await fetch('/api/db-register', options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error('Failed to register account: ' + result.errors);
            }

            console.log(result.contents);
            setRegSuccess(result.contents);
            if (response.ok) {
                nav("/room/lobby", { replace: true }); // default to lobby
            }

        } catch (error) {
            console.error(error);
            setRegError(error.message);
        }
    }

    return(
        <div>
            <Navbar/>
            <div className="register-form">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <label>Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit">Register</button>
                    {regSuccess && <p role="status">{regSuccess}</p>}
                    {regError && <p role="alert">{regError}</p>}
                </form>
            </div>
        </div> 
    )
}

export default Register;