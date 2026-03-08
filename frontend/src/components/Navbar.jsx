import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Dashboard", icon: "🏠" },
    { to: "/upload", label: "Upload", icon: "📷" },
    { to: "/closet", label: "My Closet", icon: "👗" },
    { to: "/outfits", label: "Outfits", icon: "✨" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="navbar-logo">👔</span>
          <span className="navbar-title">ClosetAI</span>
        </Link>
      </div>
      <ul className="navbar-links">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={location.pathname === link.to ? "active" : ""}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
