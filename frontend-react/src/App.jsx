import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login";
import Inventory from "./Inventory";
import ProductDetail from "./ProductDetail";
import AIChat from "./pages/AIChat"; // Import du nouveau composant IA

// Petit composant pour protéger tes routes (si pas de token, retour au Login)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("auth_token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique : La seule accessible sans badge */}
        <Route path="/login" element={<Login />} />

        {/* Routes protégées : Amira doit être connectée */}
        <Route path="/" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        
        <Route path="/inventory" element={
          <PrivateRoute><Inventory /></PrivateRoute>
        } />
        
        {/* Route dynamique pour voir un produit précis */}
        <Route path="/inventory/:id" element={
          <PrivateRoute><ProductDetail /></PrivateRoute>
        } />

        {/* L'assistant IA qui analyse tes stocks */}
        <Route path="/assistant" element={
          <PrivateRoute><AIChat /></PrivateRoute>
        } />

        {/* Si Amira se perd sur une URL inconnue, on la ramène à l'accueil */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;