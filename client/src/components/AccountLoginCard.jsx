// account login card
// prompts the user if they want to be a guest, login, or register for an account
import { Link } from "react-router-dom"

function AccLoginCard() {
    return(
        <div className="acc-login-component">
            <h1>Before you enter...</h1>
            
            <div className="acc-login-signin">
                <p>Please sign in:</p>
                <div className="acc-login-option">
                    <Link to="/login">
                        <button className="acc-login-button">Login</button>
                    </Link>
                </div>

                <div className="acc-login-option">
                    <Link to="/register">
                        <button className="acc-login-button">Register</button>
                    </Link>
                </div>

                <p>Or continue as a guest:</p>
                <div className="acc-login-option">
                    <button className="acc-login-button">Continue as Guest</button>
                </div>
            </div>
        </div>
    )
}

export default AccLoginCard;