import { useAdmitedStudentsQuery } from "../../redux/api/authApi";

const PlacementPost = () => {
  console.log("PlacementPost component loaded");

  // Get admitted students data from API
  const { data: admittedStudents, isLoading, error } = useAdmitedStudentsQuery();

  // Filter only placed students (those with placedInfo)
  const placedStudents = admittedStudents?.filter(student => student.placedInfo !== null) || [];

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        padding: "24px", 
        backgroundColor: "#f8fafc", 
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
          <p style={{ fontSize: "1.1rem", color: "#64748b" }}>Loading placement stories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        padding: "24px", 
        backgroundColor: "#f8fafc", 
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "16px" }}>❌</div>
          <p style={{ fontSize: "1.1rem", color: "#ef4444" }}>Error loading placement data</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "24px", 
      minHeight: "100vh" 
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "32px"
      }}>
        <h1 style={{ 
          fontSize: "2.5rem", 
          fontWeight: "bold", 
          color: "#1a202c",
          marginBottom: "8px"
        }}>
          🎉 Placement Success Stories
        </h1>
        <p style={{ 
          fontSize: "1.1rem", 
          color: "#64748b"
        }}>
          Celebrating our students achievements and career milestones
        </p>
      </div>

      {/* Empty state when no placed students */}
      {placedStudents.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🎓</div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>
            No Placement Stories Yet
          </h3>
          <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
            Success stories will appear here as students get placed
          </p>
        </div>
      ) : (
        /* Cards Grid - 3 cards per row */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "24px",
          maxWidth: "1400px",
          margin: "0 auto"
        }}>
        {placedStudents.map((student) => (
          <div
            key={student.id}
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              border: "1px solid #e2e8f0",
              position: "relative"
            }}
          >
            {/* Top logos section */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px 8px 20px"
            }}>
              <div style={{
                width: "60px",
                height: "40px",
                backgroundColor: "#f3f4f6",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: "#374151"
              }}>
                SSISM
              </div>
              <div style={{
                width: "50px",
                height: "30px",
                backgroundColor: "#FDA92D",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: "bold",
                color: "white"
              }}>
                ITEG
              </div>
            </div>

            {/* Congratulations heading */}
            <div style={{ textAlign: "center", padding: "0 20px" }}>
              <h2 style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "#1e40af",
                marginBottom: "4px"
              }}>
                Congratulations
              </h2>
              <p style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginBottom: "16px"
              }}>
                We are proud to announce that our ITEG student
              </p>
            </div>

            {/* Student photo */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "16px"
            }}>
              <div style={{
                borderRadius: "50%",
                padding: "3px",
                background: "#f97316"
              }}>
                <img
                  src={student.image || student.profileImage || "https://via.placeholder.com/100x100/e2e8f0/64748b?text=Student"}
                  alt={`${student.firstName} ${student.lastName}`}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid white"
                  }}
                />
              </div>
            </div>

            {/* Student details */}
            <div style={{ textAlign: "center", padding: "0 20px" }}>
              <h3 style={{
                fontSize: "1.125rem",
                fontWeight: "bold",
                color: "#1e40af",
                marginBottom: "4px"
              }}>
                {student.firstName} {student.lastName}
              </h3>
              <p style={{
                fontSize: "0.875rem",
                color: "#374151",
                marginBottom: "2px"
              }}>
                {student.address}
              </p>
              <p style={{
                fontSize: "0.875rem",
                color: "#374151",
                marginBottom: "16px"
              }}>
                {student.course}
              </p>
            </div>

            {/* Placement info */}
            <div style={{ textAlign: "center", padding: "0 20px 20px 20px" }}>
              <p style={{
                fontSize: "0.875rem",
                color: "#374151",
                marginBottom: "8px"
              }}>
                got placed as a{" "}
                <span style={{ fontWeight: "bold" }}>{student.placedInfo.jobProfile}</span> in
              </p>
              
              {/* Company info */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "16px"
              }}>
                <div style={{
                  width: "24px",
                  height: "16px",
                  backgroundColor: "#2563eb",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6rem",
                  fontWeight: "bold",
                  color: "white"
                }}>
                  CO
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{
                    color: "#2563eb",
                    fontWeight: "600",
                    fontSize: "0.875rem",
                    lineHeight: "1.2"
                  }}>
                    {student.placedInfo.companyName}
                  </div>
                  <div style={{
                    color: "#6b7280",
                    fontSize: "0.75rem"
                  }}>
                    {student.placedInfo.location} • ₹{(student.placedInfo.salary / 100000).toFixed(1)} LPA
                  </div>
                </div>
              </div>

              {/* Background college image placeholder */}
              <div style={{
                width: "100%",
                height: "60px",
                backgroundColor: "#f3f4f6",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                color: "#9ca3af",
                opacity: 0.7
              }}>
                Campus Background
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default PlacementPost;