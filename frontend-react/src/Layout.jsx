import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { apiGet } from "./utils/api";

function Layout({ title, children, user, onLogout }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("fr");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const notificationPopoverRef = useRef(null);
  const settingsModalRef = useRef(null);

  // Charger les alertes au montage et périodiquement
  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000); // Rafraîchir toutes les 30s
    return () => clearInterval(interval);
  }, []);

  // Fonction pour charger les alertes
  const loadAlerts = async () => {
    try {
      setAlertsLoading(true);
      const data = await apiGet("/alertes-stock");
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des alertes:", error);
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  };

  // Fermer le popover quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationPopoverRef.current &&
        !notificationPopoverRef.current.contains(event.target) &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fermer la modal paramètres quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        settingsModalRef.current &&
        !settingsModalRef.current.contains(event.target)
      ) {
        setShowSettingsModal(false);
      }
    };

    if (showSettingsModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSettingsModal]);

  // Fonction pour chercher dans l'API
  const handleSearchInput = async (query) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const results = await response.json();
        setSearchResults(Array.isArray(results) ? results.slice(0, 5) : []);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gérer la touche Entrée
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (searchQuery.trim()) {
        setShowDropdown(false);
        navigate(`/inventory?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  // Sélectionner un produit depuis le dropdown
  const handleSelectProduct = (productId) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(`/inventory?productId=${productId}`);
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    navigate("/login");
  };

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>StockFlow B2B</div>

        <div style={styles.menuTitle}>MANAGEMENT</div>

        <nav style={styles.nav}>
          <Link to="/" style={styles.link}>Dashboard</Link>
          <Link to="/inventory" style={styles.link}>Inventory</Link>
          <Link to="/assistant" style={styles.link}>AI Assistant</Link>
        </nav>
      </aside>

      <div style={styles.main}>
        <header style={styles.topbar}>
          <div style={styles.searchContainer}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search inventory, orders, or suppliers..."
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowDropdown(true);
                }
              }}
              style={styles.search}
            />

            {isLoading && (
              <div style={styles.searchStatus}>⏳ Searching...</div>
            )}

            {showDropdown && searchResults.length > 0 && (
              <div ref={dropdownRef} style={styles.dropdown}>
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      ...styles.dropdownItem,
                      backgroundColor: hoveredItemId === product.id ? "#f8fafc" : "transparent"
                    }}
                    onClick={() => handleSelectProduct(product.id)}
                    onMouseEnter={() => setHoveredItemId(product.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    <div style={styles.productName}>{product.nom}</div>
                    <div style={styles.productInfo}>
                      {product.marque && (
                        <span>{product.marque} • </span>
                      )}
                      ${product.prix_vente}
                    </div>
                  </div>
                ))}
                {searchQuery.trim() && (
                  <div
                    style={{
                      ...styles.dropdownFooter,
                      backgroundColor: hoveredItemId === "footer" ? "#eff6ff" : "#f8fafc"
                    }}
                    onClick={() => {
                      setShowDropdown(false);
                      navigate(`/inventory?search=${encodeURIComponent(searchQuery)}`);
                    }}
                    onMouseEnter={() => setHoveredItemId("footer")}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    <strong>View all results for "{searchQuery}"</strong> →
                  </div>
                )}
              </div>
            )}

            {showDropdown && searchResults.length === 0 && searchQuery.trim().length >= 2 && !isLoading && (
              <div ref={dropdownRef} style={styles.dropdown}>
                <div style={styles.noResults}>
                  Aucun produit trouvé. Appuyez sur Entrée pour chercher partout.
                </div>
              </div>
            )}
          </div>

          <div style={styles.topbarRight}>
            <div
              ref={notificationRef}
              style={styles.iconContainer}
              onClick={() => setShowNotifications(!showNotifications)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e2e8f0"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
            >
              <div style={styles.icon}>🔔</div>
              {alerts.length > 0 && (
                <div style={styles.badge}>{alerts.length}</div>
              )}

              {showNotifications && (
                <div ref={notificationPopoverRef} style={styles.notificationPopover}>
                  <div style={styles.popoverHeader}>
                    <strong>Stock Alerts</strong>
                    {alerts.length > 0 && (
                      <span style={styles.popoverBadge}>{alerts.length}</span>
                    )}
                  </div>

                  {alertsLoading ? (
                    <div style={styles.popoverContent}>
                      <div style={styles.popoverLoading}>Loading alerts...</div>
                    </div>
                  ) : alerts.length > 0 ? (
                    <div style={styles.popoverContent}>
                      {alerts.map((alert, index) => (
                        <div
                          key={index}
                          style={styles.alertItem}
                          onClick={() => {
                            navigate(`/inventory/${alert.produit_id}`);
                            setShowNotifications(false);
                          }}
                        >
                          <div style={styles.alertIcon}>⚠️</div>
                          <div style={styles.alertDetails}>
                            <div style={styles.alertTitle}>{alert.nom}</div>
                            <div style={styles.alertInfo}>
                              Stock: {alert.quantite_actuelle}/{alert.seuil_alerte}
                            </div>
                          </div>
                          <div style={styles.alertArrow}>→</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.popoverContent}>
                      <div style={styles.popoverEmpty}>
                        ✓ Tous les stocks sont bons
                      </div>
                    </div>
                  )}

                  <div style={styles.popoverFooter}>
                    <button
                      onClick={() => {
                        navigate("/inventory");
                        setShowNotifications(false);
                      }}
                      style={styles.viewAllBtn}
                    >
                      View all inventory
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              style={styles.iconContainer}
              onClick={() => setShowSettingsModal(true)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e2e8f0"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
              title="Paramètres du compte"
            >
              <div style={styles.icon}>⚙️</div>
            </div>

            <div style={styles.userBox}>
              <div>
                <div style={styles.userName}>{user?.name || "User"}</div>
                <div style={styles.userRole}>Stock Manager</div>
              </div>
              <div style={styles.avatar}>👤</div>
            </div>

            <button
              onClick={handleLogout}
              style={styles.logoutBtn}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Settings Modal */}
        {showSettingsModal && (
          <div style={styles.modalOverlay}>
            <div ref={settingsModalRef} style={styles.modal}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Paramètres du Compte</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  style={styles.modalCloseBtn}
                  title="Fermer"
                >
                  ✕
                </button>
              </div>

              <div style={styles.modalContent}>
                {/* User Information Section */}
                <div style={styles.settingSection}>
                  <h3 style={styles.settingSectionTitle}>Informations Utilisateur</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <label style={styles.infoLabel}>Nom:</label>
                      <span style={styles.infoValue}>{user?.name || "Utilisateur"}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <label style={styles.infoLabel}>Email:</label>
                      <span style={styles.infoValue}>{user?.email || "non@disponible.com"}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <label style={styles.infoLabel}>Rôle:</label>
                      <span style={styles.infoValue}>
                        <span style={styles.roleBadge}>{user?.role || "Stock Manager"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Change Password Section */}
                <div style={styles.settingSection}>
                  <h3 style={styles.settingSectionTitle}>Changer le Mot de Passe</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nouveau mot de passe:</label>
                    <div style={styles.passwordInputContainer}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Entrez votre nouveau mot de passe"
                        style={styles.input}
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        style={styles.togglePasswordBtn}
                        title={showPassword ? "Masquer" : "Afficher"}
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Language Selector */}
                <div style={styles.settingSection}>
                  <h3 style={styles.settingSectionTitle}>Langue</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Sélectionner la langue:</label>
                    <select
                      value={currentLanguage}
                      onChange={(e) => setCurrentLanguage(e.target.value)}
                      style={styles.select}
                    >
                      <option value="fr">🇫🇷 Français</option>
                      <option value="en">🇬🇧 Anglais</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  style={styles.cancelBtn}
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    // Simuler la sauvegarde
                    console.log("Paramètres sauvegardés:", {
                      language: currentLanguage,
                      newPassword: newPassword ? "***" : "non modifié"
                    });
                    setShowSettingsModal(false);
                    setNewPassword("");
                  }}
                  style={styles.saveBtn}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        <main style={styles.content}>
          <h1 style={styles.pageTitle}>{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
  },
  sidebar: {
    width: "240px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: "24px 16px",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#2563eb",
  },
  menuTitle: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "12px",
    fontWeight: "bold",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  link: {
    textDecoration: "none",
    color: "#334155",
    padding: "12px 14px",
    borderRadius: "10px",
    fontWeight: "500",
    backgroundColor: "#f8fafc",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    height: "80px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
  },
  searchContainer: {
    position: "relative",
    width: "360px",
  },
  search: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #dbe2ea",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  searchStatus: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "12px",
    color: "#94a3b8",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    border: "1px solid #dbe2ea",
    borderTop: "none",
    borderRadius: "0 0 10px 10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    maxHeight: "300px",
    overflowY: "auto",
  },
  dropdownItem: {
    padding: "12px 14px",
    cursor: "pointer",
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s",
  },
  productName: {
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "4px",
    fontSize: "14px",
  },
  productInfo: {
    fontSize: "12px",
    color: "#64748b",
  },
  dropdownFooter: {
    padding: "12px 14px",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    textAlign: "center",
    fontSize: "13px",
    color: "#2563eb",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
  noResults: {
    padding: "16px 14px",
    textAlign: "center",
    fontSize: "13px",
    color: "#94a3b8",
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  icon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    cursor: "pointer",
  },
  iconContainer: {
    position: "relative",
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  badge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    backgroundColor: "#dc2626",
    color: "white",
    borderRadius: "50%",
    width: "22px",
    height: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "bold",
    border: "2px solid white",
  },
  notificationPopover: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#ffffff",
    border: "1px solid #dbe2ea",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
    zIndex: 1000,
    minWidth: "320px",
    maxWidth: "380px",
    overflow: "hidden",
    marginTop: "8px",
  },
  popoverHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },
  popoverBadge: {
    backgroundColor: "#dc2626",
    color: "white",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "bold",
  },
  popoverContent: {
    maxHeight: "300px",
    overflowY: "auto",
  },
  popoverLoading: {
    padding: "20px 16px",
    textAlign: "center",
    fontSize: "13px",
    color: "#94a3b8",
  },
  alertItem: {
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  alertIcon: {
    fontSize: "18px",
    flexShrink: 0,
  },
  alertDetails: {
    flex: 1,
    minWidth: 0,
  },
  alertTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  alertInfo: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  alertArrow: {
    fontSize: "16px",
    color: "#cbd5e1",
    flexShrink: 0,
  },
  popoverEmpty: {
    padding: "20px 16px",
    textAlign: "center",
    fontSize: "13px",
    color: "#16a34a",
  },
  popoverFooter: {
    padding: "12px 16px",
    borderTop: "1px solid #f1f5f9",
    backgroundColor: "#f8fafc",
  },
  viewAllBtn: {
    width: "100%",
    padding: "8px 12px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userName: {
    fontWeight: "bold",
    fontSize: "14px",
    color: "#1e293b",
  },
  userRole: {
    fontSize: "12px",
    color: "#64748b",
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    backgroundColor: "#fee2e2",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    color: "#b91c1c",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  content: {
    padding: "24px",
  },
  pageTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#0f172a",
  },
  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15)",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    animation: "slideIn 0.3s ease-out",
  },
  modalHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1e293b",
    margin: 0,
  },
  modalCloseBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#94a3b8",
    padding: "0",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    transition: "background-color 0.2s",
  },
  modalContent: {
    flex: 1,
    overflow: "auto",
    padding: "24px",
  },
  settingSection: {
    marginBottom: "24px",
  },
  settingSectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#64748b",
    marginBottom: "12px",
    margin: "0 0 12px 0",
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    padding: "16px",
    border: "1px solid #e2e8f0",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
  },
  infoLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },
  infoValue: {
    fontSize: "13px",
    color: "#1e293b",
  },
  roleBadge: {
    backgroundColor: "#dbeafe",
    color: "#0c4a6e",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    display: "block",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #dbe2ea",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  passwordInputContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  togglePasswordBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "0",
    color: "#94a3b8",
    transition: "color 0.2s",
  },
  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #dbe2ea",
    fontSize: "13px",
    outline: "none",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  modalFooter: {
    padding: "16px 24px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    backgroundColor: "#f8fafc",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
  },
  cancelBtn: {
    padding: "10px 18px",
    borderRadius: "8px",
    backgroundColor: "#e2e8f0",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  saveBtn: {
    padding: "10px 18px",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};

export default Layout;