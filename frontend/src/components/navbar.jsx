import Cookie from "js-cookie";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import '../App.css';
import './navbar.css';

function Navbar() {
    const location = useLocation();
    const [signedIn, setSignedIn] = useState(false);

    useEffect(() => {
        if (Cookie.get("signed_in_user") !== undefined) {
            setSignedIn(Cookie.get("signed_in_user"));
        } else {
            setSignedIn(false);
        }
    }, []);

    function logout() {
        Cookie.remove("signed_in_user");
        window.location.replace(`http://${window.location.host}/`);
    }

    return (
        <nav className="navbar">
            <ul className="navbar-list">
                <li className={`navbar-item ${location.pathname === '/' ? 'active' : ''}`}>
                    <Link to="/">Home</Link>
                </li>
                {signedIn !== false ? (
                    <>
                        <li className={`navbar-item ${location.pathname === '/todos' ? 'active' : ''}`}>
                            <Link to="/todos">Todos</Link>
                        </li>
                        <li className={`navbar-item ${location.pathname === '/todo-histroy' ? 'active' : ''}`}>
                            <Link to="/todo-history">Todos history</Link>
                        </li>
                        <li className={`navbar-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                            <Link to="/profile">Profile</Link>
                        </li>
                        <li className={`navbar-item`}>
                            <Link onClick={logout}>Logout</Link>
                        </li>
                    </>
                ) : (
                    <>
                        <li className={`navbar-item ${location.pathname === '/login' ? 'active' : ''}`}>
                            <Link to="/login">Login</Link>
                        </li>
                        <li className={`navbar-item ${location.pathname === '/register' ? 'active' : ''}`}>
                            <Link to="/register">Register</Link>
                        </li>
                    </>
                )
                }
            </ul>
        </nav>
    );
}

export default Navbar;