const NotFound = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ marginBottom: "16px", fontSize: "36px", fontWeight: "bold" }}>404</h1>
        <p style={{ marginBottom: "16px", fontSize: "20px", color: "#4b5563" }}>Oops! Page not found</p>
        <a href="/" style={{ color: "#3b82f6", textDecoration: "underline", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.color = "#1d4ed8"} onMouseLeave={(e) => e.currentTarget.style.color = "#3b82f6"}>
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
