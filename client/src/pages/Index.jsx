// Landing page (when you first enter the website)
import Navbar from "../components/Navbar"
import {Link} from "react-router-dom"

function Index() {
    return(
        <div className="index-page">
            <Navbar/>
            <div className="index">
                <h1 className="index-title">ArtBuk</h1>
                <Link to="/home">
                    <button className="index index-button">Enter Gallery</button>
                </Link>
            </div>
        </div>
    )
}

export default Index;