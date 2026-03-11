import Layout from "./Layout";

function Dashboard() {
  const produitsFaibles = [
    { nom: "Oxford Cotton Shirt", taille: "M / Blue Sky", stock: 450, seuil: 100, statut: "In Stock" },
    { nom: "Slim Fit Chinos", taille: "32 / Khaki", stock: 45, seuil: 50, statut: "Low Stock" },
    { nom: "Wool Blend Blazer", taille: "L / Grey", stock: 12, seuil: 15, statut: "Low Stock" },
    { nom: "Graphic Jersey Tee", taille: "S / Off-White", stock: 890, seuil: 200, statut: "In Stock" },
    { nom: "Linen Blend Shorts", taille: "XL / Navy", stock: 62, seuil: 60, statut: "Near Threshold" },
  ];

  const alertes = [
    "IMMEDIATE RESTOCK - Wool Blend Blazer",
    "IMMEDIATE RESTOCK - Slim Fit Chinos",
    "SUPPLIER DELAY - Graphic Jersey Tee",
  ];

  return (
    <Layout title="Dashboard">
      <div style={styles.statsRow}>
        <div style={styles.card}>
          <p style={styles.cardTitle}>Total Items</p>
          <h2 style={styles.cardNumber}>12,450</h2>
          <span style={styles.green}>+2.5% this month</span>
        </div>

        <div style={styles.card}>
          <p style={styles.cardTitle}>Low Stock Alerts</p>
          <h2 style={styles.cardNumber}>18</h2>
          <span style={styles.red}>+4 since yesterday</span>
        </div>

        <div style={styles.card}>
          <p style={styles.cardTitle}>Monthly Movement</p>
          <h2 style={styles.cardNumber}>+2,400</h2>
          <span style={styles.green}>+8% vs last month</span>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.bigCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Inventory Overview</h3>
            <button style={styles.button}>+ New Item</button>
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
              {produitsFaibles.map((produit, index) => (
                <tr key={index}>
                  <td style={styles.td}>{produit.nom}</td>
                  <td style={styles.td}>{produit.taille}</td>
                  <td style={styles.td}>{produit.stock}</td>
                  <td style={styles.td}>{produit.seuil}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor:
                          produit.statut === "In Stock"
                            ? "#dcfce7"
                            : produit.statut === "Low Stock"
                            ? "#fee2e2"
                            : "#fef3c7",
                        color:
                          produit.statut === "In Stock"
                            ? "#166534"
                            : produit.statut === "Low Stock"
                            ? "#b91c1c"
                            : "#92400e",
                      }}
                    >
                      {produit.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.sidePanel}>
          <h3 style={styles.sectionTitle}>Priority Alerts</h3>

          {alertes.map((alerte, index) => (
            <div key={index} style={styles.alertCard}>
              <p style={styles.alertText}>{alerte}</p>
              <div style={styles.alertButtons}>
                <button style={styles.orderBtn}>Order Now</button>
                <button style={styles.dismissBtn}>Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

const styles = {
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
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
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
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
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
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
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
};

export default Dashboard;