// register
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginSuccess, setLoginSuccess] = useState('');

    const nav = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoginError('');
        setLoginSuccess('');
        const loginCredentials = { email, password };

        const options = {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify(loginCredentials)
        }

        try {
            const response = await fetch('/api/db-login', options);
            console.log(response);
            const result = await response.json();

            if (!response.ok) {
                throw new Error("Failed to login to account: " + result.errors);
            }

            setLoginSuccess(result.contents);
            if (response.ok) {
                console.log(result.token);
                localStorage.setItem("token", result.token);
                nav("/dashboard", { replace: true })
            }

        } catch (error) {
            console.error(error);
            setLoginError(error.message);
        }
    }

    return(
        <div>
            <Navbar/>
            <div className="login-form">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input type="text" id="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <label>Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <button type="submit">Login</button>
                </form>
            </div>
            {loginSuccess && <p role="alert">{loginSuccess}</p>}
            {loginError && <p role="alert">{loginError}</p>}
        </div>
    )
}

export default Login;