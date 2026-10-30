// register
import { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [regError, setRegError] = useState('');

    const nav = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
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
                throw new Error('Failed to login to account: ' + result.errors);
            }

            console.log(result.contents);
            setRegError();

        } catch (error) {
            console.error("Error: ", error);
            setRegError(error);
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
                    {regError && <p>{regError.message}</p>}
                </form>
            </div>
        </div> 
    )
}

export default Register;