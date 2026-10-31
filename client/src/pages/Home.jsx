// landing page after gallery is entered
// maybe this can hold all gallery info?
import Navbar from "../components/Navbar"
import AccLoginCard from "../components/AccountLoginCard";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


function Home() {
    const nav = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            console.log("already logged in, going to dashboard")
            nav("/dashboard");
        }
    }, []);

    return (
        <div className="home-page">
            <Navbar/>
            <main className="home-content">
                <AccLoginCard/>
            </main>
        </div>
    )
}

export default Home;