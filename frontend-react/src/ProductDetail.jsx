import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import Modal from "./components/Modal";
import { apiGet, apiPost } from "./utils/api";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editForm, setEditForm] = useState({
    nom: "",
    description: "",
    categorie_id: "",
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [isEditUploading, setIsEditUploading] = useState(false);
  const [variantForm, setVariantForm] = useState({
    taille: "",
    couleur: "",
    quantite_actuelle: "",
    seuil_alerte: "",
  });
  const [stockForm, setStockForm] = useState({
    variante_id: "",
    type: "entree",
    quantite: "",
  });

  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await apiGet("/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  const openEditModal = () => {
    if (produit) {
      setEditForm({
        nom: produit.nom || "",
        description: produit.description || "",
        categorie_id: produit.categorie_id || "",
      });
      setEditImageFile(null);
      setEditImagePreview(produit.image_url || "");
      setShowEditModal(true);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    
    if (!editForm.nom || !editForm.categorie_id) {
      window.alert("Veuillez remplir tous les champs requis.");
      return;
    }

    try {
      setIsEditUploading(true);

      const payload = new FormData();
      payload.append("nom", editForm.nom);
      payload.append("description", editForm.description || "");
      payload.append("categorie_id", editForm.categorie_id);
      if (editImageFile) {
        payload.append("image", editImageFile);
      }
      payload.append("_method", "PUT");

      const response = await apiPost(`/produits/${id}`, payload);
      
      if (response.status === 200) {
        window.alert("Produit mis à jour avec succès!");
        setShowEditModal(false);
        loadProduct();
      } else {
        window.alert(response.message || "Erreur lors de la mise à jour du produit.");
      }
    } catch {
      window.alert("Erreur réseau.");
    } finally {
      setIsEditUploading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setEditImageFile(null);
      setEditImagePreview(produit?.image_url || "");
      return;
    }

    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await apiGet(`/produits/${id}`);
      setProduit(data);
    } catch {
      setProduit(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    
    if (!variantForm.taille || !variantForm.couleur || variantForm.quantite_actuelle === "" || variantForm.seuil_alerte === "") {
      window.alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await apiPost("/variantes", {
        produit_id: parseInt(id),
        taille: variantForm.taille,
        couleur: variantForm.couleur,
        quantite_actuelle: parseInt(variantForm.quantite_actuelle),
        seuil_alerte: parseInt(variantForm.seuil_alerte),
      });

      if (response.status === 201 || response.status === 200) {
        window.alert("Variante ajoutée avec succès!");
        setVariantForm({ taille: "", couleur: "", quantite_actuelle: "", seuil_alerte: "" });
        setShowVariantModal(false);
        loadProduct();
      } else {
        window.alert("Erreur lors de l'ajout de la variante.");
      }
    } catch {
      window.alert("Erreur réseau.");
    }
  };

  const handleStockMovement = async (e) => {
    e.preventDefault();
    
    if (!stockForm.variante_id || stockForm.quantite === "") {
      window.alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await apiPost("/mouvements", {
        variante_id: parseInt(stockForm.variante_id),
        type: stockForm.type.toUpperCase(), // Convert to uppercase for API
        quantite: parseInt(stockForm.quantite),
      });

      if (response.status === 201 || response.status === 200) {
        window.alert("Mouvement de stock enregistré!");
        setStockForm({ variante_id: "", type: "entree", quantite: "" });
        setShowStockModal(false);
        loadProduct();
      } else {
        window.alert("Erreur lors de l'enregistrement du mouvement.");
      }
    } catch {
      window.alert("Erreur réseau.");
    }
  };

  const handleVariantInputChange = (e) => {
    const { name, value } = e.target;
    setVariantForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStockInputChange = (e) => {
    const { name, value } = e.target;
    setStockForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <div style={styles.loading}>Loading product details...</div>
      </Layout>
    );
  }

  if (!produit) {
    return (
      <Layout title="Product Not Found">
        <div style={styles.error}>
          <p>Product not found.</p>
          <button style={styles.backButton} onClick={() => navigate("/inventory")}>
            Back to Inventory
          </button>
        </div>
      </Layout>
    );
  }

  const totalStock = produit.variantes
    ? produit.variantes.reduce((sum, v) => sum + (v.quantite_actuelle || 0), 0)
    : 0;

  const activeVariants = produit.variantes ? produit.variantes.length : 0;

  return (
    <Layout title="Product Details & Variant Management">
      <div style={styles.topCard}>
        <div>
          <h2 style={styles.productTitle}>{produit.nom}</h2>
          <p style={styles.productMeta}>
            {produit.categorie?.nom || "No Category"} | {produit.variantes?.length || 0} Variants
          </p>
        </div>

        <div style={styles.actions}>
          <button 
            style={styles.secondaryButton}
            onClick={openEditModal}
          >
            Edit Product
          </button>
          <button 
            style={styles.primaryButton}
            onClick={() => setShowStockModal(true)}
          >
            Stock Movement
          </button>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p>Total Stock</p>
          <h3>{totalStock}</h3>
        </div>
        <div style={styles.statCard}>
          <p>Active Variants</p>
          <h3>{activeVariants}</h3>
        </div>
        <div style={styles.statCard}>
          <p>Categories</p>
          <h3>{produit.categorie?.nom || "N/A"}</h3>
        </div>
      </div>

      <div style={styles.bigCard}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Variant Management</h3>
            <p style={styles.sectionSubtitle}>Manage stock levels for each size and color combination.</p>
          </div>
          <button 
            style={styles.primaryButton}
            onClick={() => setShowVariantModal(true)}
          >
            + Add Variant
          </button>
        </div>

        {produit.variantes && produit.variantes.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>SKU</th>
                <th style={styles.th}>COULEUR</th>
                <th style={styles.th}>TAILLE</th>
                <th style={styles.th}>STOCK</th>
                <th style={styles.th}>SEUIL ALERTE</th>
                <th style={styles.th}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {produit.variantes.map((variante) => {
                const statut =
                  variante.quantite_actuelle <= variante.seuil_alerte ? "Low Stock" : "In Stock";
                
                return (
                  <tr key={variante.id}>
                    <td style={styles.td}>{variante.sku || "N/A"}</td>
                    <td style={styles.td}>{variante.couleur || "N/A"}</td>
                    <td style={styles.td}>{variante.taille || "N/A"}</td>
                    <td style={styles.td}>{variante.quantite_actuelle}</td>
                    <td style={styles.td}>{variante.seuil_alerte}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: statut === "In Stock" ? "#dcfce7" : "#fee2e2",
                          color: statut === "In Stock" ? "#166534" : "#b91c1c",
                        }}
                      >
                        {statut}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={styles.noVariants}>No variants available. Click "+ Add Variant" to create one.</p>
        )}
      </div>

      <div style={styles.bottomGrid}>
        <div style={styles.infoCard}>
          <h3>Product Information</h3>
          <p><strong>ID:</strong> {produit.id}</p>
          <p><strong>Category:</strong> {produit.categorie?.nom || "Uncategorized"}</p>
          <p><strong>Created At:</strong> {new Date(produit.created_at).toLocaleDateString()}</p>
        </div>

        <div style={styles.infoCard}>
          <h3>Supplier Information</h3>
          <p><strong>Supplier:</strong> {produit.fournisseur?.nom || "Not assigned"}</p>
          <p><strong>Contact:</strong> {produit.fournisseur?.email || "N/A"}</p>
        </div>
      </div>

      <div style={styles.backButtonContainer}>
        <button style={styles.backButton} onClick={() => navigate("/inventory")}>
          ← Back to Inventory
        </button>
      </div>

      <Modal 
        isOpen={showVariantModal} 
        title="Add New Variant" 
        onClose={() => setShowVariantModal(false)}
      >
        <form onSubmit={handleAddVariant} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Size *</label>
            <input
              type="text"
              name="taille"
              value={variantForm.taille}
              onChange={handleVariantInputChange}
              style={styles.input}
              placeholder="e.g., M, L, XL"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Color *</label>
            <input
              type="text"
              name="couleur"
              value={variantForm.couleur}
              onChange={handleVariantInputChange}
              style={styles.input}
              placeholder="e.g., Navy Blue"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Initial Stock *</label>
            <input
              type="number"
              name="quantite_actuelle"
              value={variantForm.quantite_actuelle}
              onChange={handleVariantInputChange}
              style={styles.input}
              placeholder="0"
              min="0"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Alert Threshold *</label>
            <input
              type="number"
              name="seuil_alerte"
              value={variantForm.seuil_alerte}
              onChange={handleVariantInputChange}
              style={styles.input}
              placeholder="10"
              min="0"
            />
          </div>

          <div style={styles.formButtons}>
            <button 
              type="button" 
              style={styles.cancelButton}
              onClick={() => setShowVariantModal(false)}
            >
              Cancel
            </button>
            <button type="submit" style={styles.submitButton}>
              Add Variant
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={showStockModal} 
        title="Stock Movement" 
        onClose={() => setShowStockModal(false)}
      >
        <form onSubmit={handleStockMovement} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Variant *</label>
            <select
              name="variante_id"
              value={stockForm.variante_id}
              onChange={handleStockInputChange}
              style={styles.input}
            >
              <option value="">Choose a variant</option>
              {produit.variantes && produit.variantes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.taille} / {v.couleur} (Current: {v.quantite_actuelle})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Movement Type *</label>
            <select
              name="type"
              value={stockForm.type}
              onChange={handleStockInputChange}
              style={styles.input}
            >
              <option value="entree">Entry (Restock)</option>
              <option value="sortie">Exit (Sale/Loss)</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Quantity *</label>
            <input
              type="number"
              name="quantite"
              value={stockForm.quantite}
              onChange={handleStockInputChange}
              style={styles.input}
              placeholder="0"
              min="1"
            />
          </div>

          <div style={styles.formButtons}>
            <button 
              type="button" 
              style={styles.cancelButton}
              onClick={() => setShowStockModal(false)}
            >
              Cancel
            </button>
            <button type="submit" style={styles.submitButton}>
              Record Movement
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={showEditModal} 
        title="Edit Product Details" 
        onClose={() => setShowEditModal(false)}
      >
        <form onSubmit={handleEditProduct} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Product Name *</label>
            <input
              type="text"
              name="nom"
              value={editForm.nom}
              onChange={handleEditInputChange}
              style={styles.input}
              placeholder="e.g., Winter Parka"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditInputChange}
              style={styles.textarea}
              placeholder="Product description"
              rows="3"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Category *</label>
            <select
              name="categorie_id"
              value={editForm.categorie_id}
              onChange={handleEditInputChange}
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

          <div style={styles.formGroup}>
            <label style={styles.label}>Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleEditImageChange}
              style={styles.input}
            />
            <small style={styles.helpText}>Formats: JPG, PNG, WEBP - max 2Mo</small>
            {editImagePreview && (
              <img
                src={editImagePreview}
                alt="Image preview"
                style={styles.imagePreview}
              />
            )}
          </div>

          <div style={styles.formButtons}>
            <button 
              type="button" 
              style={styles.cancelButton}
              onClick={() => setShowEditModal(false)}
              disabled={isEditUploading}
            >
              Cancel
            </button>
            <button type="submit" style={styles.submitButton} disabled={isEditUploading}>
              {isEditUploading ? "Uploading..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

const styles = {
  topCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  productTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: "700",
  },
  productMeta: {
    margin: "8px 0 0 0",
    color: "#64748b",
    fontSize: "14px",
  },
  actions: {
    display: "flex",
    gap: "12px",
  },
  primaryButton: {
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  secondaryButton: {
    padding: "10px 16px",
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  statCard_p: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },
  statCard_h3: {
    margin: "8px 0 0 0",
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: "700",
  },
  bigCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    marginBottom: "24px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "18px",
    fontWeight: "700",
  },
  sectionSubtitle: {
    margin: "6px 0 0 0",
    color: "#64748b",
    fontSize: "13px",
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
    fontWeight: "600",
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
  noVariants: {
    padding: "20px",
    textAlign: "center",
    color: "#64748b",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  infoCard_h3: {
    margin: "0 0 12px 0",
    color: "#0f172a",
    fontSize: "16px",
    fontWeight: "600",
  },
  infoCard_p: {
    margin: "8px 0",
    color: "#475569",
    fontSize: "13px",
  },
  backButtonContainer: {
    display: "flex",
    gap: "12px",
  },
  backButton: {
    padding: "10px 16px",
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  loading: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#64748b",
  },
  error: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#64748b",
  },
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
    color: "#475569",
    fontSize: "14px",
    fontWeight: "600",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  textarea: {
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  helpText: {
    color: "#64748b",
    fontSize: "12px",
  },
  imagePreview: {
    width: "72px",
    height: "72px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "1px solid #e2e8f0",
    marginTop: "4px",
  },
  formButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  },
  cancelButton: {
    flex: 1,
    padding: "10px 16px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  submitButton: {
    flex: 1,
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default ProductDetail;
