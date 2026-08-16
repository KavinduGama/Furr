export default function PetRecordLoading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, padding: 32 }}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #E8E6E0",
            borderTopColor: "#006B78",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ fontSize: 14, color: "#10242D", fontWeight: 700 }}>Verifying owner access grant…</p>
        <p style={{ fontSize: 12, color: "#66757C", marginTop: 4 }}>Loading encrypted clinical history</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
