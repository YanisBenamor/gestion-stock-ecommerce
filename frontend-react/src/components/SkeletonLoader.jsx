/**
 * Skeleton Loader Components
 * Provide visual feedback while data is loading with animated placeholder blocks
 */

export function SkeletonLoader({ width = "100%", height = "20px", borderRadius = "8px", margin = "0 0 16px 0" }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        margin,
        backgroundColor: "#e2e8f0",
        animation: "skeleton-loading 1s linear infinite alternate",
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div style={styles.card}>
      <SkeletonLoader width="100%" height="24px" margin="0 0 12px 0" />
      <SkeletonLoader width="80%" height="16px" margin="0 0 12px 0" />
      <SkeletonLoader width="90%" height="16px" margin="0 0 12px 0" />
      <SkeletonLoader width="60%" height="16px" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr style={styles.row}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} style={styles.cell}>
          <SkeletonLoader width="100%" height="16px" />
        </td>
      ))}
    </tr>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div style={styles.statCard}>
      <SkeletonLoader width="60%" height="18px" margin="0 0 8px 0" />
      <SkeletonLoader width="100%" height="32px" margin="0 0 8px 0" />
      <SkeletonLoader width="70%" height="14px" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div style={styles.listItem}>
      <div style={{ flex: 1 }}>
        <SkeletonLoader width="80%" height="16px" margin="0 0 8px 0" />
        <SkeletonLoader width="60%" height="14px" />
      </div>
      <SkeletonLoader width="80px" height="16px" />
    </div>
  );
}

const styles = {
  card: {
    padding: "16px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    marginBottom: "12px",
  },
  row: {
    height: "48px",
    borderBottom: "1px solid #f1f5f9",
  },
  cell: {
    padding: "12px",
    verticalAlign: "middle",
  },
  statCard: {
    padding: "16px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    flex: 1,
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
};

// CSS Animation à ajouter à index.css
export const skeletonKeyframes = `
@keyframes skeleton-loading {
  0% {
    background-color: #e2e8f0;
  }
  100% {
    background-color: #f1f5f9;
  }
}
`;
