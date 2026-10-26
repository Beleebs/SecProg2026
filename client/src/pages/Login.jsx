// register
import Navbar from "../components/Navbar";

function Login() {

    return(
        <div>
            <Navbar/>
            <div className="login-form">
                <h2>Login</h2>
                <form>
                    <label>Username or Email</label>
                    <input type="text"/>
                    <label>Password</label>
                    <input type="password"/>
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    )
}

export default Login;