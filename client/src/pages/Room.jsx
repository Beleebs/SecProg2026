// room, provides an empty room that corresponds to a database entry
import { useState } from "react";
import Navbar from "../components/Navbar";

function Room() {


    return(
        <div>
            <Navbar/>
            <div>
                <h1>Room: </h1>
                <p>Users: 0/10</p>
            </div>
        </div>
    );
}

export default Room;