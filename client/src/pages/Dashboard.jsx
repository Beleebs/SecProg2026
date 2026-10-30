// dashboard for every user
// dashboard options are provided based on user authorization
// users get: Account info, manage account, enter gallery
// employees get: Account info, manage account, enter gallery, edit/insert events
// admins get: Account info, manage account, enter gallery, edit users, view logs

import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Dashboard() {
    return (
        <div className="dashboard-page">
            <Navbar />
            <div className="dashboard">
                <h1>Dashboard</h1>
                <div className="dashboard-grid">
                
                    {/* User/Employee/Admin */}
                    <div className="dashboard-option">
                        <h2>Account Info</h2>
                        <p>Email: email@email.com</p>
                        <p>Role: user</p>
                        <p>Account Created: insert date here</p>
                    </div>

                    <div className="dashboard-option">
                        <h2>Manage Account</h2>
                        <p>i dont have options for this right now</p>
                    </div>

                    <div className="dashboard-option">
                        <h2>Enter Gallery</h2>
                        <Link to="/room/1">
                            <button>Enter Lobby</button>
                        </Link>
                    </div>

                    {/* Employee/Admin action(s) */}

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

                    {/* Admin action(s) */}

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

                </div>
            </div>
        </div>
    );
}

export default Dashboard;
