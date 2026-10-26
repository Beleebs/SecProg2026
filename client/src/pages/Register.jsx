// register
import Navbar from "../components/Navbar";

function Register() {

    return(
        <div>
            <Navbar/>
            <div className="register-form">
                <h2>Register</h2>
                <form>
                    <label>Username</label>
                    <input type="text"/>
                    <label>Email</label>
                    <input type="email"/>
                    <label>Password</label>
                    <input type="password"/>
                    <button type="submit">Register</button>
                </form>
            </div>
        </div>

        
    )
}

export default Register;