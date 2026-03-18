import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "./utils/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function Login() {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        setAuthToken(data.access_token);
        navigate("/");
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    } catch (error) {
      console.error("Erreur fetch:", error);
      setError("Erreur lors de la connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Fond dégradé décoratif */}
      <div style={styles.backgroundDecoration}></div>
      
      <div style={styles.container}>
        {/* Carte de connexion */}
        <div style={styles.card}>
          {/* Logo et titre */}
          <div style={styles.header}>
            <div style={styles.logoContainer}>
              <svg
                style={styles.logo}
                viewBox="0 0 64 64"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Boîte/carton stylisé */}
                <defs>
                  <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#2563eb", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#1e40af", stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <rect x="12" y="16" width="40" height="32" fill="url(#boxGradient)" rx="4" />
                <path d="M 12 16 L 20 8 L 60 8 L 52 16" fill="#3b82f6" />
                <circle cx="32" cy="32" r="8" fill="white" opacity="0.3" />
                <path d="M 20 28 L 28 36 M 44 28 L 36 36" stroke="white" strokeWidth="2" fill="none" opacity="0.8" />
              </svg>
            </div>
            <h1 style={styles.projectTitle}>StockFlow</h1>
            <p style={styles.projectSubtitle}>Gestion de Stocks E-commerce</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin} style={styles.form}>
            {/* Message d'erreur */}
            {error && <div style={styles.errorMessage}>{error}</div>}

            {/* Champ Email */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>✉️</span>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                style={styles.input}
                placeholder="admin@test.com"
                disabled={loading}
              />
            </div>

            {/* Champ Mot de passe */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🔐</span>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                style={styles.input}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.buttonLoading}>
                  <span style={styles.spinner}></span>
                  Connexion en cours...
                </span>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Accès sécurisé • Version 1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  },
  backgroundDecoration: {
    position: "absolute",
    top: "-50%",
    right: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)",
    pointerEvents: "none",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    position: "relative",
    zIndex: 1,
  },
  card: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "48px 40px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.05)",
    width: "100%",
    maxWidth: "420px",
    backdropFilter: "blur(10px)",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  logo: {
    width: "72px",
    height: "72px",
    filter: "drop-shadow(0 4px 12px rgba(37, 99, 235, 0.2))",
  },
  projectTitle: {
    margin: "0 0 8px 0",
    color: "#0f172a",
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  projectSubtitle: {
    margin: "0",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    color: "#1e293b",
    fontWeight: "600",
    fontSize: "14px",
  },
  labelIcon: {
    fontSize: "16px",
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    backgroundColor: "#f8fafc",
    color: "#1e293b",
  },
  "input:focus": {
    outline: "none",
    borderColor: "#2563eb",
    backgroundColor: "white",
    boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
  },
  errorMessage: {
    padding: "12px 16px",
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  button: {
    padding: "14px 20px",
    backgroundColor: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    backgroundImage: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
    marginTop: "8px",
  },
  buttonLoading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "white",
    animation: "spin 0.6s linear infinite",
  },
  footer: {
    marginTop: "32px",
    textAlign: "center",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "20px",
  },
  footerText: {
    margin: "0",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "500",
    letterSpacing: "0.3px",
  },
};

// Ajouter les animations globales
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  input:focus {
    outline: none !important;
  }
`;
document.head.appendChild(styleSheet);

export default Login;
