import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Closet from "./pages/Closet";
import Outfits from "./pages/Outfits";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/closet" element={<Closet />} />
            <Route path="/outfits" element={<Outfits />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>👔 ClosetAI — Your AI-Powered Wardrobe Assistant</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
