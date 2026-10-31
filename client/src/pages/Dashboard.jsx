// dashboard for every user
// dashboard options are provided based on user authorization
// guests get: Account info, manage account, enter gallery
// employees get: Account info, manage account, enter gallery, edit/insert events
// admins get: Account info, manage account, enter gallery, edit users, view logs

import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [dashError, setDashError] = useState('');

    // employee/admin
    const [events, setEvents] = useState(null);
    const [eventError, setEventError] = useState("");
    const [eventSubmit, setEventSubmit] = useState("");
    const [eventSubmitError, setEventSubmitError] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventRoom, setEventRoom] = useState("2");

    // admin
    const [regSuccess, setRegSuccess] = useState("");
    const [regError, setRegError] = useState("");
    const [createEmail, setCreateEmail] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [createRole, setCreateRole] = useState("guest");

    const [allUsers, setAllUsers] = useState(null);
    const [allUsersError, setAllUsersError] = useState("");

    const [userRoles, setUserRoles] = useState({});
    const [updateError, setUpdateError] = useState("");
    const [updateStatus, setUpdateStatus] = useState("");

    const nav = useNavigate();

    async function loadEvents() {
        setEventError('');
        const token = localStorage.getItem("token");
        if (!token) {
            setEventError("Please login to view the dashboard");
            return;
        }

        const body = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        try {
            const response = await fetch("/api/fetch-events", body);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Could not fetch events");
            }

            setEvents(result.contents);
        } catch (error) {
            setEventError(error.message);
        }   
    }

    async function loadUsers() {
        setAllUsersError("");
        const token = localStorage.getItem("token");
        if (!token) {
            setAllUsersError("Please login to view the dashboard");
            return;
        }
        const body = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {
            const response = await fetch("/api/fetch-users", body);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Could not fetch users");
            }

            setAllUsers(result.contents);
        } catch (error) {
            setAllUsersError(error.message);
        }
    }

    async function handleUpdateUser(id) {
        setUpdateError("");
        const token = localStorage.getItem("token");
        if (!token) {
            setUpdateError("Please login to view the dashboard");
            return;
        }
        const body = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({id, role: userRoles[id] ?? allUsers.find((user) => user.id === id)?.user_role})
        }
        try {
            const response = await fetch("/api/update-user", body);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.errors || result.error || "Could not update user");
            }

            setUserRoles({});
            setUpdateStatus(response.contents);
            await loadUsers();
        } catch (error) {
            setUpdateError(error.message);
        }
    }

    async function handleDeleteUser(id) {
        setUpdateError("");
        const token = localStorage.getItem("token");
        if (!token) {
            setUpdateError("Please login to view the dashboard");
            return;
        }
        const body = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({id})
        }
        try {
            const response = await fetch("/api/delete-user", body);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.errors || result.error || "Could not update user");
            }

            setUpdateStatus(response.contents);
            await loadUsers();
        } catch (error) {
            setUpdateError(error.message);
        }
    }

    useEffect(() => {
        async function loadUser() {
            setDashError('');
            const token = localStorage.getItem("token");
            
            // indirect access, no token
            if (!token) {
                setDashError("Please login to view the dashboard");
                return;
            }

            const headers = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            try {
                const response = await fetch("/api/me", headers);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || result.message || "Could not load account");
                }

                setUser(result);

            } catch (error) {
                console.log(error);
                setDashError(error.message);
            }
        }

        loadUser();
    }, []);

    // backend information control
    useEffect(() => {
        if (user && (user.role !== "employee" && user.role !== "admin")) 
            return;
        loadEvents();
    }, [user]);

    useEffect(() => {
        if (!user || user.role !== "admin") 
            return;
        loadUsers();
    }, [user]);

    const handleLogout = async () => {
        localStorage.removeItem("token");
        nav("/", { replace: true });
    }

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setEventSubmitError('');

        const token = localStorage.getItem("token");
        const body = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({room_id: Number(eventRoom), date: eventDate})
        }
        try {
            const response = await fetch("/api/upload-event", body);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Could not create event");
            }

            setEventSubmit("Successfully created event!");
            await loadEvents();
        } catch (error) {
            setEventSubmitError(error.message);
        }
    }

    const handleCreateUser = async(e) => {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');
        
        setCreateEmail('');
        setCreatePassword('');
        setCreateRole("guest");

        const registerCredentials = { 
            email: createEmail, 
            password: createPassword, 
            role: createRole 
        };
        const token = localStorage.getItem("token");
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(registerCredentials)
        }

        try {
            const response = await fetch('/api/create-user', options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error('Failed to register account: ' + result.errors);
            }

            setRegSuccess(result.contents);
            await loadUsers();
        } catch (error) {
            console.error(error);
            setRegError(error.message);
        }
    }

    return (
        <div className="dashboard-page">
            <Navbar />
            <div className="dashboard">
                <h1>Dashboard</h1>
                {dashError && (
                    <>
                        <p>{dashError}</p>
                        <Link to="/login">
                            <button>Login</button>
                        </Link>
                    </>
                )}

                {!dashError && (
                    <div className="dashboard-grid">
                
                        {/* Guest/Employee/Admin */}
                        {user && (
                            <>
                                <div className="dashboard-option">
                                    <h2>Account Info</h2>
                                    <div>
                                        <p>Email: {user.email}</p>
                                        <p>Role: {user.role}</p>
                                    </div>
                                </div>

                                <div className="dashboard-option">
                                    <h2>Manage Account</h2>
                                    <button onClick={handleLogout}>Logout</button>
                                </div>

                                <div className="dashboard-option">
                                    <h2>Enter Gallery</h2>
                                    <Link to="/room/1">
                                        <button>Enter Lobby</button>
                                    </Link>
                                </div>
                            </>
                        )}
                        

                        {/* Employee/Admin action(s) */}
                        {user && (user.role == "employee" || user.role == "admin") && (
                            <>
                                <div className="dashboard-option">
                                    <h2>Events</h2>
                                    {eventError && <p role="alert">{eventError}</p>}
                                    <ul>
                                        {events && events.map((e) => (
                                            <li key={e.id}>
                                                Room {e.room_id} — {e.event_date ?? "No date"}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="dashboard-option">
                                    <h2>Create Event</h2>
                                    <form onSubmit={handleCreateEvent}>
                                        <label>Date of Event:</label>
                                        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}/>
                                        <label>Room of Event:</label>
                                        <select id="event-room" value={eventRoom} onChange={(e) => setEventRoom(e.target.value)}>
                                            <option value="1">Lobby</option>
                                            <option value="2">Room 1</option>
                                            <option value="3">Room 2</option>
                                            <option value="4">Room 3</option>
                                            <option value="5">Room 4</option>
                                            <option value="6">Room 5</option>
                                            <option value="7">Storage</option>
                                        </select>
                                        <button type="submit">Create Event</button>
                                    </form>
                                    {eventSubmitError && <p role="alert">{eventSubmitError}</p>}
                                    {eventSubmit && <p role="status">{eventSubmit}</p>}
                                </div>

                                <div className="dashboard-option">
                                    <h2>Create Image</h2>
                                    <form>
                                        <label>Image File:</label>
                                        <input type="image" />
                                        <label>Image Name:</label>
                                        <input id="" type="text" />
                                        <label>Art Event:</label>
                                        <select id="image-event">
                                            {/* populate events */}
                                        </select>
                                        <button type="submit">Create Event</button>
                                    </form>
                                </div>

                            </>
                        )}

                        {/* Admin action(s) */}
                        {user && user.role == "admin" && (
                            <>
                                <div className="dashboard-option">
                                    <h2>Users</h2>
                                    {allUsersError && <p role="alert">{allUsersError}</p>}
                                    <table>
                                        <thead>
                                            <tr>
                                                <th scope="col">ID</th>
                                                <th scope="col">Email</th>
                                                <th scope="col">Role</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allUsers && allUsers.map((user) => (
                                                <tr key={user.id}>
                                                    <td>{user.id}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.user_role}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="dashboard-option">
                                    <h2>Create User</h2>
                                    <form onSubmit={handleCreateUser}>
                                        <label>Email:</label>
                                        <input type="email" value={createEmail} onChange={(e) => setCreateEmail((e.target.value))}/>
                                        <label>Password:</label>
                                        <input type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)}/>
                                        <label>User Role:</label>
                                        <select id="user-role" value={createRole} onChange={(e) => setCreateRole(e.target.value)}>
                                            <option value="guest">Guest</option>
                                            <option value="employee">Employee</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button type="submit">Create User</button>
                                    </form>
                                    {regSuccess && <p role="status">{regSuccess}</p>}
                                    {regError && <p role="alert">{regError}</p>}
                                </div>

                                <div className="dashboard-option">
                                    <h2>Edit/Delete Users</h2>
                                    {updateError && <p role="alert">{updateError}</p>}
                                    <table>
                                        <thead>
                                            <tr>
                                                <th scope="col">ID</th>
                                                <th scope="col">Email</th>
                                                <th scope="col">Role</th>
                                                <th scope="col">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allUsers && allUsers.map((u) => (
                                                <tr key={u.id}>
                                                    <td>{u.id}</td>
                                                    <td>{u.email}</td>
                                                    <td>
                                                        {/* Allows for multiple roles to be changed at once */}
                                                        <select value={userRoles[u.id] ?? u.user_role} onChange={(e) => setUserRoles((roles) => ({...roles, [u.id]: e.target.value}))}>
                                                            <option value="guest">Guest</option>
                                                            <option value="employee">Employee</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <button type="button" onClick={() => handleUpdateUser(u.id)}>Save</button>
                                                        <button type="button" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="dashboard-option">
                                    <h2>View Logs</h2>
                                    {/* populate logs */}
                                </div>
                            </>
                        )}
                    </div>
                )}    
            </div>
        </div>
    );
}

export default Dashboard;
