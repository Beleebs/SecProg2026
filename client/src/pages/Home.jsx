// landing page after gallery is entered
// maybe this can hold all gallery info?
import Navbar from "../components/Navbar"
import AccLoginCard from "../components/AccountLoginCard";

function Home() {
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