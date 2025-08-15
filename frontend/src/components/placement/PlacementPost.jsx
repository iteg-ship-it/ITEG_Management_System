const PlacementPost = () => {
  console.log('PlacementPost component loaded');

  // Sample data for placed students
  const placedStudents = [
    {
      id: 1,
      name: "Rahul Sharma",
      company: "Google",
      package: "25 LPA",
      position: "Software Engineer",
      image: "https://via.placeholder.com/150",
      placementDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Priya Singh",
      company: "Microsoft",
      package: "22 LPA",
      position: "Frontend Developer",
      image: "https://via.placeholder.com/150",
      placementDate: "2024-01-20"
    },
    {
      id: 3,
      name: "Amit Kumar",
      company: "Amazon",
      package: "28 LPA",
      position: "Full Stack Developer",
      image: "https://via.placeholder.com/150",
      placementDate: "2024-01-25"
    },
    {
      id: 4,
      name: "Sneha Patel",
      company: "TCS",
      package: "8 LPA",
      position: "Software Developer",
      image: "https://via.placeholder.com/150",
      placementDate: "2024-02-01"
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>Placement Success Stories</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {placedStudents.map((student) => (
          <div key={student.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                height: '128px'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-48px',
                left: '24px'
              }}>
                <img
                  src={student.image}
                  alt={student.name}
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    border: '4px solid white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>

            <div style={{ paddingTop: '64px', paddingBottom: '24px', paddingLeft: '24px', paddingRight: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>{student.name}</h3>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>{student.position}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Company:</span>
                  <span style={{ fontWeight: '600', color: '#2563eb' }}>{student.company}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Package:</span>
                  <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{student.package}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Placed on:</span>
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>{new Date(student.placementDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                <button style={{
                  width: '100%',
                  background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {placedStudents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ color: '#9ca3af', fontSize: '4rem', marginBottom: '16px' }}>🎓</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>No Placements Yet</h3>
          <p style={{ color: '#6b7280' }}>Placement success stories will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default PlacementPost;
