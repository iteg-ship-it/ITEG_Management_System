import React from "react";
import ReactDOM from "react-dom/client";

console.log('🚀 Step 1: Imports loaded');

try {
  console.log('🚀 Step 2: Loading CSS...');
  await import("./index.css");
  console.log('✅ Step 2: CSS loaded');

  console.log('🚀 Step 3: Loading Redux store...');
  const { store } = await import("./redux/store.js");
  console.log('✅ Step 3: Redux store loaded');

  console.log('🚀 Step 4: Loading App component...');
  const { default: App } = await import("./App.jsx");
  console.log('✅ Step 4: App component loaded');

  console.log('🚀 Step 5: Loading Provider...');
  const { Provider } = await import("react-redux");
  console.log('✅ Step 5: Provider loaded');

  console.log('API URL:', import.meta.env.VITE_API_URL);

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found!');
  }

  console.log('🚀 Step 6: Rendering app...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );

  console.log('✅ React app rendered successfully!');
} catch (error) {
  console.error('❌ Fatal Error:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial; background: #fee; min-height: 100vh;">
      <h1 style="color: #c00;">❌ Application Error</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <p><strong>Stack:</strong></p>
      <pre style="background: white; padding: 10px; overflow: auto;">${error.stack}</pre>
      <p>Please check the browser console for more details.</p>
    </div>
  `;
}
