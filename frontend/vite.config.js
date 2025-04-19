// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   // server: {
//   //   port: 5000, 
//   // },
// })


// vite.config.js
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   test: {
//     globals: true,
//     environment: 'jsdom',
//     setupFiles: './src/setupTests.jsx',
//   },
// })



// vite.config.js
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   test: {
//     globals: true,
//     environment: "jsdom",
   
//  setupFiles: "./src/setupTests.js",
//   },
// });



import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";



// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // This is crucial to use 'it', 'expect', and other global test functions
    environment: "jsdom", // Ensure this is set to simulate browser-like environment
  },
});
