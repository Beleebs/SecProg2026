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

    const nav = useNavigate();

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

    const handleLogout = async () => {
        localStorage.removeItem("token");
        nav("/", { replace: true });
    }

    const handleCreateUser = async(e) => {
        e.preventDefault();
        setDashError('');
        const registerCredentials = { email, password, user };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registerCredentials)
        }

        try {
            const response = await fetch('/api/db-register', options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error('Failed to register account: ' + result.errors);
            }

            console.log(result.contents);
            setRegSuccess(result.contents);
            if (response.ok) {
                nav("/login", { replace: true }); // navigate to login
            }

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
                                    <button disabled={user.email == "user@email.com" || user.email == "employ@email.com" || user.email == "admin@email.com"}>Delete Account</button>
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
                                    <h2>Edit Events</h2>
                                    {/* populate events */}
                                </div>

                                <div className="dashboard-option">
                                    <h2>Create Event</h2>
                                    <form>
                                        <label>Date of Event:</label>
                                        <input type="date" />
                                        <label>User at Event:</label>
                                        <input type="text" />
                                        <label>Room of Event:</label>
                                        <select id="user-role">
                                            <option value="lobby">Lobby</option>
                                            <option value="room1">Room 1</option>
                                            <option value="room2">Room 2</option>
                                            <option value="room3">Room 3</option>
                                            <option value="room4">Room 4</option>
                                            <option value="room5">Room 5</option>
                                            <option value="storage">Storage</option>
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
                                    <h2>Edit Users</h2>
                                    {/* populate users */}
                                </div>

                                <div className="dashboard-option">
                                    <h2>Create User</h2>
                                    <form>
                                        <label>Email:</label>
                                        <input type="email" />
                                        <label>Password:</label>
                                        <input type="password" />
                                        <label>User Role:</label>
                                        <select id="user-role">
                                            <option value="user">User</option>
                                            <option value="employee">Employee</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button type="submit">Create User</button>
                                    </form>
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
