// room, provides an empty room that corresponds to a database entry
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar";
import ArtCard from "../components/ArtCard";

function Room() {
    const { roomId } = useParams();
    const [roomData, setRoomData] = useState(null);
    const [roomError, setRoomError] = useState("");
    const [adjRooms, setAdjRooms] = useState(null);
    const [navError, setNavError] = useState("");
    const [artData, setArtData] = useState(null);

    const nav = useNavigate();

    useEffect(() => {
        // prevents overwriting requests
        // not network wide, more a client side thing
        let cancelled = false;

        async function loadRoom() {
            setRoomData(null);
            setRoomError("");
            setNavError("");
            setArtData(null);
            const token = localStorage.getItem("token");

            const headers = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

            try {
                const body = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ room: Number(roomId) })
                }
                const enterResponse = await fetch("/api/enter-room", body);
                const enterResult = await enterResponse.json();

                if (!enterResponse.ok) {
                    throw new Error(enterResult.errors || "Failed to get room data");
                }

                const roomResponse = await fetch("/api/get-rooms", headers);
                const roomResult = await roomResponse.json();

                if (!roomResponse.ok) {
                    throw new Error(roomResult.error || "Failed to load rooms");
                }

                console.log(roomResult);

                const room = roomResult.contents.find(
                    (item) => item.id === Number(roomId)
                );

                if (!room) {
                    throw new Error(`Room "${roomId}" was not found`);
                }

                if (!cancelled) {
                    setRoomData(room);

                    const connectionResponse = await fetch("/api/get-room-connections", body);
                    console.log(connectionResponse);
                    const connectionResult = await connectionResponse.json();

                    if (!connectionResponse.ok) {
                        throw new Error(connectionResult.error || "Failed to load adjacent rooms");
                    }

                    console.log(connectionResult);
                    console.log(enterResult);
                    setArtData(enterResult.contents);

                    const roomsById = new Map(
                        roomResult.contents.map((room) => [Number(room.id), room])
                    );

                    // fancy way to get the room names on the buttons instead of id's
                    setAdjRooms(
                        connectionResult.contents.map((connection) => {
                            const adjacentRoom = roomsById.get(Number(connection.room2_id));

                            return {
                                id: connection.room2_id,
                                name: adjacentRoom?.room_name ?? `Room ${connection.room2_id}`,
                            };
                        })
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    setRoomError(error.message);
                } 
            }
        }

        loadRoom();
        return () => {
            cancelled = true;
        };
    }, [roomId]);

    // click on one of the adjacent rooms
    const handleRoomNavigate = async (destination) => {
        nav(`/room/${destination}`);
    };

    return (
        <div>
            <Navbar />
            {roomError && (
                <>
                    <p role="alert">{roomError}</p>
                    <button onClick={() => handleRoomNavigate(1)}>Back to Lobby</button>
                </>
            )}
            {!roomError && !roomData && <p>Loading room...</p>}
            {roomData && (
                <div>
                    <div>
                        <h1>Room: {roomData.room_name}</h1>
                        <p>Capacity: {roomData.capacity}</p>
                        <br />
                        <h2>Adjacent Rooms:</h2>
                        {adjRooms && adjRooms.map((room) => (
                            <button id={room.id} key={room.id} onClick={() => handleRoomNavigate(room.id)}>{room.name}</button>
                        ))}
                        {navError && <p role="alert">{navError}</p>}
                    </div>

                    <div>
                        {artData && artData.map((art) => (
                            <ArtCard key={art.id} artData={art} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Room;