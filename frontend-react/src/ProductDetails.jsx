import Layout from "./Layout";

function ProductDetails() {
  const variantes = [
    { sku: "WP-NY-S", couleur: "Navy", taille: "S", statut: "In Stock", stock: 142, engagement: "12 Pending" },
    { sku: "WP-NY-M", couleur: "Navy", taille: "M", statut: "In Stock", stock: 85, engagement: "28 Pending" },
    { sku: "WP-BK-L", couleur: "Black", taille: "L", statut: "Low Stock", stock: 14, engagement: "4 Pending" },
    { sku: "WP-OV-XL", couleur: "Olive", taille: "XL", statut: "Out of Stock", stock: 0, engagement: "0 Pending" },
    { sku: "WP-BK-S", couleur: "Black", taille: "S", statut: "In Stock", stock: 210, engagement: "55 Pending" },
  ];

  return (
    <Layout title="Product Details & Variant Management">
      <div style={styles.topCard}>
        <div>
          <h2 style={styles.productTitle}>Winter Parka</h2>
          <p style={styles.productMeta}>WP-2024-001 | Outerwear Collection | $120.00 Base Price</p>
        </div>

        <div style={styles.actions}>
          <button style={styles.secondaryButton}>Edit Product</button>
          <button style={styles.primaryButton}>Stock Movement</button>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p>Total Stock</p>
          <h3>1,240</h3>
        </div>
        <div style={styles.statCard}>
          <p>Active Variants</p>
          <h3>12</h3>
        </div>
        <div style={styles.statCard}>
          <p>Monthly Sales</p>
          <h3>450</h3>
        </div>
      </div>

      <div style={styles.bigCard}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Variant Management</h3>
            <p style={styles.sectionSubtitle}>Manage stock levels for each size and color combination.</p>
          </div>
          <button style={styles.primaryButton}>+ Add Variant</button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>SKU</th>
              <th style={styles.th}>COLOR</th>
              <th style={styles.th}>SIZE</th>
              <th style={styles.th}>STATUS</th>
              <th style={styles.th}>STOCK LEVEL</th>
              <th style={styles.th}>COMMITMENT</th>
            </tr>
          </thead>
          <tbody>
            {variantes.map((item, index) => (
              <tr key={index}>
                <td style={styles.td}>{item.sku}</td>
                <td style={styles.td}>{item.couleur}</td>
                <td style={styles.td}>{item.taille}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor:
                        item.statut === "In Stock"
                          ? "#dcfce7"
                          : item.statut === "Low Stock"
                          ? "#ffedd5"
                          : "#fee2e2",
                      color:
                        item.statut === "In Stock"
                          ? "#166534"
                          : item.statut === "Low Stock"
                          ? "#c2410c"
                          : "#b91c1c",
                    }}
                  >
                    {item.statut}
                  </span>
                </td>
                <td style={styles.td}>{item.stock}</td>
                <td style={styles.td}>{item.engagement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.bottomGrid}>
        <div style={styles.infoCard}>
          <h3>Material & Care</h3>
          <p><strong>Shell Material:</strong> 100% Recycled Polyester</p>
          <p><strong>Insulation:</strong> PrimaLoft® Gold Eco</p>
          <p><strong>Care Instructions:</strong> Machine Wash Cold, Tumble Dry Low</p>
        </div>

        <div style={styles.infoCard}>
          <h3>Supplier Information</h3>
          <p><strong>Supplier:</strong> Nordic Apparel Group</p>
          <p><strong>Lead Time:</strong> 14-21 days</p>
          <button style={styles.secondaryButton}>Contact Supplier</button>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  topCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  productTitle: {
    margin: 0,
    fontSize: "32px",
    color: "#0f172a",
  },
  productMeta: {
    color: "#64748b",
    marginTop: "8px",
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#e2e8f0",
    color: "#1e293b",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  statsRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: "220px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  bigCard: {
    backgroundColor: "white",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    marginBottom: "24px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  sectionTitle: {
    margin: 0,
    color: "#0f172a",
  },
  sectionSubtitle: {
    margin: "6px 0 0 0",
    color: "#64748b",
    fontSize: "14px",
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
  },
  badge: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  infoCard: {
    backgroundColor: "white",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
};

export default ProductDetails;