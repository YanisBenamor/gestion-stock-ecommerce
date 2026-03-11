import { Link } from "react-router-dom";

function Layout({ title, children }) {
  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>StockFlow B2B</div>

        <div style={styles.menuTitle}>MANAGEMENT</div>

        <nav style={styles.nav}>
          <Link to="/" style={styles.link}>Dashboard</Link>
          <Link to="/produit" style={styles.link}>Inventory</Link>
          <Link to="/assistant" style={styles.link}>AI Assistant</Link>
        </nav>
      </aside>

      <div style={styles.main}>
        <header style={styles.topbar}>
          <input
            type="text"
            placeholder="Search inventory, orders, or suppliers..."
            style={styles.search}
          />

          <div style={styles.topbarRight}>
            <div style={styles.icon}>🔔</div>
            <div style={styles.icon}>⚙️</div>

            <div style={styles.userBox}>
              <div>
                <div style={styles.userName}>Alex Rivers</div>
                <div style={styles.userRole}>Stock Manager</div>
              </div>
              <div style={styles.avatar}>👤</div>
            </div>
          </div>
        </header>

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
  search: {
    width: "360px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #dbe2ea",
    outline: "none",
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
  content: {
    padding: "24px",
  },
  pageTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#0f172a",
  },
};

export default Layout;