import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../utils/api";

const fallbackStyles = {
  container: {
    marginTop: "24px",
    backgroundColor: "#2563eb",
    borderRadius: "12px",
    padding: "24px",
    color: "#ffffff",
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.35)",
  },
  overline: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#bfdbfe",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px",
  },
  productName: {
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "4px",
  },
  description: {
    fontSize: "14px",
    color: "#dbeafe",
    marginBottom: "24px",
    lineHeight: 1.4,
  },
  chart: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    height: "64px",
    marginTop: "16px",
  },
  bar: {
    width: "20%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: "2px",
    borderTopRightRadius: "2px",
    transition: "all 300ms",
  },
};

function PeakDemandAlert() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadPeakDemand = async () => {
      try {
        setLoading(true);
        const payload = await apiGet("/dashboard/peak-demand");

        if (!mounted) {
          return;
        }

        if (!payload || !Array.isArray(payload.chart_data) || payload.chart_data.length === 0) {
          setData(null);
          return;
        }

        setData(payload);
      } catch {
        if (mounted) {
          setData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPeakDemand();

    return () => {
      mounted = false;
    };
  }, []);

  const maxValue = useMemo(() => {
    if (!data?.chart_data?.length) {
      return 0;
    }

    return Math.max(...data.chart_data, 0);
  }, [data]);

  if (loading || !data) {
    return null;
  }

  return (
    <div className="mt-6 bg-blue-600 rounded-xl p-6 text-white shadow-lg" style={fallbackStyles.container}>
      <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2" style={fallbackStyles.overline}>
        Peak Demand Alert
      </h3>

      <p className="text-xl font-bold mb-1" style={fallbackStyles.productName}>{data.product_name}</p>

      <p className="text-sm text-blue-100 mb-6" style={fallbackStyles.description}>
        Sales velocity increased by {data.increase_percentage}% in the last 48 hours.
      </p>

      <div className="flex items-end gap-2 h-16 mt-4" style={fallbackStyles.chart}>
        {data.chart_data.map((value, index) => {
          const ratio = maxValue > 0 ? value / maxValue : 0;
          const height = `${Math.max(10, Math.round(ratio * 100))}%`;
          const opacity = Math.max(0.25, ratio);

          return (
            <div
              key={`peak-bar-${index}`}
              className="w-1/5 bg-white rounded-t-sm transition-all duration-300"
              style={{ ...fallbackStyles.bar, height, opacity }}
              title={`Day ${index + 1}: ${value}`}
            ></div>
          );
        })}
      </div>
    </div>
  );
}

export default PeakDemandAlert;
