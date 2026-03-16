import Layout from "./Layout";

function AssistantIA() {
  return (
    <Layout title="AI Local Assistant Panel">
      <div style={styles.wrapper}>
        <div style={styles.chatBox}>
          <div style={styles.questionRow}>
            <div style={styles.questionBubble}>
              Which summer dresses are below the stock threshold?
            </div>
          </div>

          <div style={styles.answerBox}>
            <p style={styles.answerIntro}>
              I've scanned your summer collection. Currently, 3 models are trending below their established safety thresholds due to high weekend sales volume:
            </p>

            <div style={styles.productCard}>
              <div>
                <strong>Floral Midi Summer Dress</strong>
                <p style={styles.smallText}>SKU: SM-DRS-004 | Category: Apparel</p>
              </div>
              <div style={styles.stockInfo}>
                <span style={styles.red}>Current: 12 units</span>
                <span>Threshold: 45 units</span>
              </div>
            </div>

            <div style={styles.productCard}>
              <div>
                <strong>Linen Button-down Mini</strong>
                <p style={styles.smallText}>SKU: SM-DRS-089 | Category: Apparel</p>
              </div>
              <div style={styles.stockInfo}>
                <span style={styles.red}>Current: 8 units</span>
                <span>Threshold: 30 units</span>
              </div>
            </div>

            <div style={styles.productCard}>
              <div>
                <strong>Boho Chic Maxi Dress</strong>
                <p style={styles.smallText}>SKU: SM-DRS-112 | Category: Apparel</p>
              </div>
              <div style={styles.stockInfo}>
                <span style={styles.orange}>Current: 24 units</span>
                <span>Threshold: 25 units</span>
              </div>
            </div>

            <p style={styles.footerText}>
              Would you like me to prepare a draft purchase order for these items based on predicted seasonal demand?
            </p>

            <button style={styles.primaryButton}>Generate Purchase Order</button>
          </div>
        </div>

        <div style={styles.inputBar}>
          <input
            type="text"
            placeholder="Ask about stock, orders, or suppliers..."
            style={styles.input}
          />
          <button style={styles.sendButton}>➜</button>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  wrapper: {
    maxWidth: "900px",
  },
  chatBox: {
    backgroundColor: "white",
    borderRadius: "18px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    padding: "24px",
    marginBottom: "20px",
  },
  questionRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
  },
  questionBubble: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: "14px 18px",
    borderRadius: "16px",
    maxWidth: "420px",
    fontWeight: "500",
  },
  answerBox: {
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    padding: "20px",
  },
  answerIntro: {
    marginTop: 0,
    color: "#334155",
    lineHeight: 1.6,
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "14px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
  },
  stockInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "14px",
    color: "#475569",
  },
  smallText: {
    margin: "6px 0 0 0",
    fontSize: "13px",
    color: "#64748b",
  },
  red: {
    color: "#ef4444",
    fontWeight: "600",
  },
  orange: {
    color: "#f97316",
    fontWeight: "600",
  },
  footerText: {
    color: "#475569",
    marginTop: "20px",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "10px",
  },
  inputBar: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    padding: "12px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "15px",
    padding: "10px",
  },
  sendButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "18px",
  },
};

export default AssistantIA;