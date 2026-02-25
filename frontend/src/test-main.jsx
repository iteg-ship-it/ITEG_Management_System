import React from "react";
import ReactDOM from "react-dom/client";

console.log('🔍 Testing React...');

try {
  const root = document.getElementById("root");
  if (!root) {
    console.error('❌ Root element not found!');
  } else {
    console.log('✅ Root element found');
    
    ReactDOM.createRoot(root).render(
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>✅ React is Working!</h1>
        <p>If you see this, React is loading correctly.</p>
        <p>API URL: {import.meta.env.VITE_API_URL}</p>
      </div>
    );
    console.log('✅ React rendered successfully');
  }
} catch (error) {
  console.error('❌ React Error:', error);
  document.body.innerHTML = `<h1 style="color: red;">Error: ${error.message}</h1>`;
}
