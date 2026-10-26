// navbar, applicable on most pages
import {Link, BrowserRouter} from "react-router-dom"

function Navbar() {
    return(
        <>
            <nav>
                <Link to="/">ArtBuk</Link>
                <ul>
                    <li>
                        <Link to="/home">Home</Link>
                    </li>
                    <li>
                        <Link to="/about">About</Link>
                    </li>
                </ul>
            </nav>
        </>
    )
}

export default Navbar;