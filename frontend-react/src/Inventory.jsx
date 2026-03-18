import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "./Layout";
import Modal from "./components/Modal";
import { apiDelete, apiGet, apiPost, useFetchData } from "./utils/api";
import { ProductCardSkeleton } from "./components/SkeletonLoader";

function Inventory() {
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    categorie_id: "",
    prix_vente: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Utiliser SWR pour fetch les data avec cache automatique
  const { data: produits, isLoading: loading, mutate: mutateProduits } = useFetchData("/produits");
  const { data: categories } = useFetchData("/categories");

  // Filtrer les produits avec useMemo pour optimiser
  const filteredProduits = useMemo(() => {
    const searchQuery = searchParams.get("search");
    const productId = searchParams.get("productId");

    if (productId) {
      // Si c'est une recherche directe par ID de produit
      navigate(`/inventory/${productId}`);
      return [];
    } else if (searchQuery) {
      // Filtrer les produits par nom ou description
      return produits.filter((product) =>
        product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    } else {
      // Afficher tous les produits
      return produits;
    }
  }, [searchParams, produits, navigate]);

  const handleProductClick = (id) => {
    navigate(`/inventory/${id}`);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.categorie_id || !formData.prix_vente) {
      window.alert("Veuillez remplir tous les champs requis.");
      return;
    }

    try {
      setIsUploading(true);

      const payload = new FormData();
      payload.append("nom", formData.nom);
      payload.append("description", formData.description || "");
      payload.append("categorie_id", formData.categorie_id);
      payload.append("prix_vente", formData.prix_vente);

      if (imageFile) {
        payload.append("image", imageFile);
      }

      const response = await apiPost("/produits", payload);
      if (response.status === 201 || response.status === 200) {
        window.alert("Produit créé avec succès!");
        setFormData({ nom: "", description: "", categorie_id: "", prix_vente: "" });
        setImageFile(null);
        setImagePreview("");
        setShowModal(false);
        // Revalider les données avec SWR
        mutateProduits();
      } else {
        window.alert(response.message || "Erreur lors de la création du produit.");
      }
    } catch {
      window.alert("Erreur réseau.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (e, productId, productName) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      `Supprimer le produit "${productName}" ?\n\nCette action est irréversible et supprimera aussi ses variantes.`
    );

    if (!confirmed) return;

    try {
      const response = await apiDelete(`/produits/${productId}`);

      if (response.ok) {
        window.alert(response.message || "Produit supprimé avec succès.");
        mutateProduits();
      } else {
        window.alert(response.message || "Erreur lors de la suppression du produit.");
      }
    } catch {
      window.alert("Erreur réseau lors de la suppression du produit.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetCreateForm = () => {
    setFormData({ nom: "", description: "", categorie_id: "", prix_vente: "" });
    setImageFile(null);
    setImagePreview("");
    setShowModal(false);
  };

  return (
    <Layout title="Inventory Management">
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>All Products</h2>
          <button 
            style={styles.addButton}
            onClick={() => setShowModal(true)}
          >
            + Add New Product
          </button>
        </div>

        <Modal 
          isOpen={showModal} 
          title="Add New Product" 
          onClose={resetCreateForm}
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

            <div style={styles.formGroup}>
              <label style={styles.label}>Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={styles.input}
              />
              <small style={styles.helpText}>Formats: JPG, PNG, WEBP - max 2Mo</small>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={styles.imagePreview}
                />
              )}
            </div>

            <div style={styles.formButtons}>
              <button 
                type="button" 
                style={styles.cancelButton}
                onClick={resetCreateForm}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button type="submit" style={styles.submitButton} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Add Product"}
              </button>
            </div>
          </form>
        </Modal>

        {loading ? (
          <div style={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProduits.length === 0 ? (
          <div style={styles.empty}>
            {searchParams.get("search") 
              ? `No products found matching "${searchParams.get("search")}"` 
              : "No products found"}
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredProduits.length > 0 && searchParams.get("search") && (
              <div style={styles.searchInfo}>
                Found {filteredProduits.length} product{filteredProduits.length !== 1 ? "s" : ""} matching "{searchParams.get("search")}"
              </div>
            )}
            {filteredProduits.map((produit) => {
              const totalStock = produit.variantes
                ? produit.variantes.reduce((sum, v) => sum + (v.quantite_actuelle || 0), 0)
                : 0;
              
              const variantCount = produit.variantes ? produit.variantes.length : 0;
              
              return (
                <div
                  key={produit.id}
                  style={styles.card}
                  onClick={() => handleProductClick(produit.id)}
                >
                  {/* Product Image */}
                  <div style={styles.cardImage}>
                    {produit.image_url ? (
                      <img 
                        src={produit.image_url} 
                        alt={produit.nom}
                        style={styles.cardImageImg}
                      />
                    ) : (
                      <div style={styles.cardImagePlaceholder}>
                        <span style={styles.cardImageIcon}>📷</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{produit.nom}</h3>
                    <span style={styles.badge}>
                      {variantCount} variant{variantCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  
                  <div style={styles.cardMeta}>
                    <p><strong>Total Stock:</strong> {totalStock}</p>
                    <p><strong>Category:</strong> {produit.categorie?.nom || "N/A"}</p>
                  </div>

                  <div style={styles.cardFooter}>
                    <button
                      style={styles.viewButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(produit.id);
                      }}
                    >
                      View Details
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={(e) => handleDeleteProduct(e, produit.id, produit.nom)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  headerTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "24px",
  },
  addButton: {
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  searchInfo: {
    padding: "12px 16px",
    backgroundColor: "#dbeafe",
    border: "1px solid #93c5fd",
    borderRadius: "8px",
    color: "#1e40af",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "16px",
    width: "100%",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    cursor: "pointer",
    transition: "box-shadow 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardImage: {
    width: "100%",
    height: "200px",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "8px",
  },
  cardImageImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImageIcon: {
    fontSize: "48px",
    color: "#cbd5e1",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    gap: "12px",
  },
  cardTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "18px",
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#dbeafe",
    color: "#0369a1",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  cardMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cardMeta_p: {
    margin: 0,
    fontSize: "14px",
    color: "#475569",
  },
  cardFooter: {
    display: "flex",
    gap: "10px",
    marginTop: "auto",
  },
  viewButton: {
    flex: 1,
    padding: "8px 12px",
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
  },
  deleteButton: {
    padding: "8px 12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
  },
  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
  },
  empty: {
    padding: "40px",
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

export default Inventory;
