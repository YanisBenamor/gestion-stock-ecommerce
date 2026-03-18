/**
 * Optimized Components with React.memo and useMemo
 * Prevents unnecessary re-renders when props haven't changed
 */

import { memo } from "react";

export const ProductCard = memo(({ produit, onViewDetails, styles }) => {
  const totalStock = produit.variantes
    ? produit.variantes.reduce((sum, v) => sum + (v.quantite_actuelle || 0), 0)
    : 0;

  const variantCount = produit.variantes ? produit.variantes.length : 0;

  return (
    <div style={styles.card}>
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
          onClick={() => onViewDetails(produit.id)}
        >
          View Details
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export const DashboardStatCard = memo(({ label, value, trend, trendColor, styles }) => {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{label}</p>
      <h2 style={styles.cardNumber}>{value}</h2>
      <span style={{ color: trendColor || "#10b981" }}>{trend}</span>
    </div>
  );
});

DashboardStatCard.displayName = "DashboardStatCard";

export const AlertCard = memo(({ alert, onRestock, styles }) => {
  return (
    <div style={styles.alertCard}>
      <p style={styles.alertText}>
        {alert.produit && alert.produit.nom
          ? `RESTOCK - ${alert.produit.nom} (${alert.taille || "N/A"} / ${alert.couleur || "N/A"})`
          : "RESTOCK - Unknown"}
      </p>
      <div style={styles.alertButtons}>
        <button
          style={styles.orderBtn}
          onClick={() => onRestock(alert.id)}
        >
          Order Now
        </button>
        <button style={styles.dismissBtn}>Dismiss</button>
      </div>
    </div>
  );
});

AlertCard.displayName = "AlertCard";
