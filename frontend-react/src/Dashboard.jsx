
import Layout from "./Layout";
import { useEffect, useState, useMemo, React } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./components/Modal";
import PeakDemandAlert from "./components/PeakDemandAlert";
import { apiGet, apiPost, clearAuthToken, useFetchData } from "./utils/api";
import { DashboardStatSkeleton, TableRowSkeleton } from "./components/SkeletonLoader";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    categorie_id: "",
    prix_vente: "",
  });
  const navigate = useNavigate();

  // Ajouter les styles de hover globaux
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      .dashboard-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  // Utiliser SWR pour fetch les données avec cache automatique
  const { data: produits, isLoading: loadingProduits, mutate: mutateProduits } = useFetchData("/produits");
  const { data: alertes, isLoading: loadingAlertes, mutate: mutateAlertes } = useFetchData("/alertes-stock");
  const { data: categories, isLoading: loadingCategories } = useFetchData("/categories");

  const loadUser = async () => {
    try {
      const userData = await apiGet("/user");
      setUser(userData);
    } catch {
      setUser(null);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.categorie_id || !formData.prix_vente) {
      window.alert("Veuillez remplir tous les champs requis.");
      return;
    }

    try {
      const response = await apiPost("/produits", formData);
      if (response.status === 201 || response.status === 200) {
        window.alert("Produit créé avec succès!");
        setFormData({ nom: "", description: "", categorie_id: "", prix_vente: "" });
        setShowModal(false);
        // Revalider les données avec SWR
        mutateProduits();
      } else {
        window.alert("Erreur lors de la création du produit.");
      }
    } catch {
      window.alert("Erreur réseau.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = async () => {
    try {
      await apiPost("/logout", {});
    } catch {
      // Erreur ignorée, on procède au logout anyway
    }
    clearAuthToken();
    navigate("/login");
  };

  const handleRestock = async (varianteId) => {
    const quantiteSaisie = window.prompt("Combien d'articles souhaitez-vous ajouter au stock ?");

    if (quantiteSaisie === null) {
      return;
    }

    const quantite = parseInt(quantiteSaisie, 10);
    if (Number.isNaN(quantite) || quantite <= 0) {
      window.alert("Veuillez saisir une quantite valide.");
      return;
    }

    try {
      const response = await apiPost("/mouvements", {
        variante_id: varianteId,
        type: "ENTREE",
        quantite: parseInt(quantiteSaisie, 10),
      });

      if (response.status === 200 || response.status === 201) {
        window.alert("Reapprovisionnement enregistre avec succes.");
        // Revalider les données avec SWR
        mutateProduits();
        mutateAlertes();
      } else {
        window.alert("Echec du reapprovisionnement.");
      }
    } catch {
      window.alert("Erreur reseau pendant le reapprovisionnement.");
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <Layout title="Dashboard" user={user} onLogout={handleLogout}>
      <div style={styles.dashboardWrapper}>
        {/* Décoration de fond */}
        <div style={styles.backgroundDecoration}></div>

        {/* Header avec logo */}
        <div style={styles.dashboardHeader}>
          <div style={styles.headerContent}>
            <svg
              style={styles.headerLogo}
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
            >
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
            <div>
              <h1 style={styles.headerTitle}>StockFlow</h1>
              <p style={styles.headerSubtitle}>Tableau de bord de gestion</p>
            </div>
          </div>
        </div>

        {/* Contenu du dashboard */}
        <div style={styles.dashboardContent}>
      <div style={styles.statsRow}>
        <div style={styles.card} className="dashboard-card">
          <p style={styles.cardTitle}>Total Items</p>
          <h2 style={styles.cardNumber}>{produits.length}</h2>
          <span style={styles.green}>+2.5% this month</span>
        </div>

        <div style={styles.card} className="dashboard-card">
          <p style={styles.cardTitle}>Low Stock Alerts</p>
          <h2 style={styles.cardNumber}>{alertes.length}</h2>
          <span style={styles.red}>+4 since yesterday</span>
        </div>

        <div style={styles.card} className="dashboard-card">
          <p style={styles.cardTitle}>Monthly Movement</p>
          <h2 style={styles.cardNumber}>+2,400</h2>
          <span style={styles.green}>+8% vs last month</span>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.bigCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Inventory Overview</h3>
            <button 
              style={styles.button}
              onClick={() => setShowModal(true)}
            >
              + New Item
            </button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>PRODUCT NAME</th>
                <th style={styles.th}>SIZE/COLOR</th>
                <th style={styles.th}>CURRENT STOCK</th>
                <th style={styles.th}>THRESHOLD</th>
                <th style={styles.th}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loadingProduits ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={5} />
                  ))}
                </>
              ) : (
                produits.map((produit, index) => {
                  const variante = produit.variantes && produit.variantes.length > 0 ? produit.variantes[0] : null;
                  const quantite = variante ? variante.quantite_actuelle : null;
                  const seuil = variante ? variante.seuil_alerte : null;
                  const taille = variante ? variante.taille : 'N/A';
                  const couleur = variante ? variante.couleur : 'N/A';
                  const statut = (quantite !== null && seuil !== null && quantite <= seuil) ? 'Low Stock' : 'In Stock';
                  return (
                    <tr key={index}>
                      <td style={styles.td}>{produit.nom}</td>
                      <td style={styles.td}>{taille} / {couleur}</td>
                      <td style={styles.td}>{quantite !== null ? quantite : 'N/A'}</td>
                      <td style={styles.td}>{seuil !== null ? seuil : 'N/A'}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor:
                              statut === 'In Stock' ? '#dcfce7' : '#fee2e2',
                            color:
                              statut === 'In Stock' ? '#166534' : '#b91c1c',
                          }}
                        >
                          {statut}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.sideColumn}>
          <div style={styles.sidePanel}>
            <h3 style={styles.sectionTitle}>Priority Alerts</h3>
            {loadingAlertes ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={styles.alertCard}>
                    <DashboardStatSkeleton />
                  </div>
                ))}
              </>
            ) : (
              alertes.map((alerte, index) => (
                <div key={index} style={styles.alertCard}>
                  <p style={styles.alertText}>
                    {alerte.produit && alerte.produit.nom
                      ? `RESTOCK - ${alerte.produit.nom} (${alerte.taille || 'N/A'} / ${alerte.couleur || 'N/A'})`
                      : 'RESTOCK - Unknown'}
                  </p>
                  <div style={styles.alertButtons}>
                    <button
                      style={styles.orderBtn}
                      onClick={() => handleRestock(alerte.id)}
                    >
                      Order Now
                    </button>
                    <button style={styles.dismissBtn}>Dismiss</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <PeakDemandAlert />
        </div>
      </div>
        </div>
        </div>

      <Modal 
        isOpen={showModal} 
        title="Add New Product" 
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleAddProduct} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Product Name *</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="e.g., Winter Parka"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              style={styles.textarea}
              placeholder="Product description"
              rows="3"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Price *</label>
            <input
              type="number"
              name="prix_vente"
              value={formData.prix_vente}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="99.99"
              step="0.01"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Category *</label>
            <select
              name="categorie_id"
              value={formData.categorie_id}
              onChange={handleInputChange}
              style={styles.input}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formButtons}>
            <button 
              type="button" 
              style={styles.cancelButton}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button type="submit" style={styles.submitButton}>
              Create Product
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: "14px",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  textarea: {
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  formButtons: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "8px",
  },
  cancelButton: {
    padding: "10px 16px",
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitButton: {
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  statsRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  card: {
    flex: 1,
    minWidth: "220px",
    backgroundColor: "white",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.7)",
    cursor: "default",
  },
  cardTitle: {
    color: "#64748b",
    marginBottom: "8px",
    fontSize: "14px",
  },
  cardNumber: {
    margin: 0,
    color: "#0f172a",
    fontSize: "34px",
  },
  green: {
    color: "#10b981",
    fontSize: "13px",
    fontWeight: "600",
  },
  red: {
    color: "#ef4444",
    fontSize: "13px",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "20px",
  },
  bigCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.7)",
    transition: "all 0.3s ease",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: 0,
    color: "#0f172a",
  },
  button: {
    padding: "10px 14px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#64748b",
    fontSize: "12px",
  },
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #f1f5f9",
    color: "#1e293b",
    fontSize: "14px",
  },
  badge: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },
  sidePanel: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.7)",
    transition: "all 0.3s ease",
  },
  sideColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  alertCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "14px",
    marginTop: "14px",
  },
  alertText: {
    marginTop: 0,
    color: "#334155",
    fontWeight: "600",
    fontSize: "14px",
  },
  alertButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  orderBtn: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  dismissBtn: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  dashboardWrapper: {
    position: "relative",
    background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
    borderRadius: "20px",
    padding: "40px",
    minHeight: "calc(100vh - 80px)",
    overflow: "hidden",
  },
  backgroundDecoration: {
    position: "absolute",
    top: "-10%",
    right: "-5%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)",
    pointerEvents: "none",
  },
  dashboardContent: {
    position: "relative",
    zIndex: 1,
  },
  dashboardHeader: {
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "2px solid rgba(255, 255, 255, 0.5)",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)",
    borderRadius: "16px",
    padding: "24px",
    backdropFilter: "blur(10px)",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerLogo: {
    width: "48px",
    height: "48px",
    filter: "drop-shadow(0 2px 8px rgba(37, 99, 235, 0.2))",
  },
  headerTitle: {
    margin: "0",
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  headerSubtitle: {
    margin: "4px 0 0 0",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "500",
    letterSpacing: "0.3px",
  },
};

export default Dashboard;