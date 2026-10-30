// register
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const nav = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        const loginCredentials = { email, password };

        const options = {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify(loginCredentials)
        }

        try {
            const response = await fetch('http://localhost:5000/api/db-login', options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error('Failed to login to account');
            }

            console.log(result.contents[0]);

        } catch (error) {
            console.error("Error: ", error)
        }
    }

    return(
        <div>
            <Navbar/>
            <div className="login-form">
                <h2>Login</h2>
                <form>
                    <label>Email</label>
                    <input type="text" id="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <label>Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <button type="submit" onSubmit={handleSubmit}>Login</button>
                </form>
            </div>
        </div>
    )
}

export default Login;