import Cookie from "js-cookie";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import '../App.css';
import './navbar.css';

function Navbar() {
    const location = useLocation();
    const [signedIn, setSignedIn] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

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

    function toggleMenu() {
        setMenuOpen(!menuOpen);
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/">MyApp</Link>
                </div>
                <button className="menu-toggle" onClick={toggleMenu}>
                    ☰
                </button>
                <ul className={`navbar-list ${menuOpen ? 'open' : ''}`}>
                    <li className={`navbar-item ${location.pathname === '/' ? 'active' : ''}`}>
                        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                    </li>
                    {signedIn !== false ? (
                        <>
                            <li className={`navbar-item ${location.pathname === '/todos' ? 'active' : ''}`}>
                                <Link to="/todos" onClick={() => setMenuOpen(false)}>Todos</Link>
                            </li>
                            <li className={`navbar-item ${location.pathname === '/todo-history' ? 'active' : ''}`}>
                                <Link to="/todo-history" onClick={() => setMenuOpen(false)}>Todos History</Link>
                            </li>
                            <li className={`navbar-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                                <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/" onClick={() => { logout(); setMenuOpen(false); }}>Logout</Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className={`navbar-item ${location.pathname === '/login' ? 'active' : ''}`}>
                                <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                            </li>
                            <li className={`navbar-item ${location.pathname === '/register' ? 'active' : ''}`}>
                                <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
