import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Node modules chunking
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Router
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Redux
            if (id.includes('redux') || id.includes('@reduxjs')) {
              return 'redux-vendor';
            }
            // Form libraries
            if (id.includes('formik') || id.includes('yup')) {
              return 'form-vendor';
            }
            // Face API (large library)
            if (id.includes('face-api')) {
              return 'face-vendor';
            }
            // UI libraries
            if (id.includes('lucide-react') || id.includes('react-toastify')) {
              return 'ui-vendor';
            }
            // Crypto
            if (id.includes('crypto-js')) {
              return 'crypto-vendor';
            }
            // Chart/Graph libraries
            if (id.includes('chart') || id.includes('recharts') || id.includes('d3')) {
              return 'chart-vendor';
            }
            // Date libraries
            if (id.includes('date-fns') || id.includes('moment') || id.includes('dayjs')) {
              return 'date-vendor';
            }
            // Utility libraries
            if (id.includes('lodash') || id.includes('ramda') || id.includes('underscore')) {
              return 'utils-vendor';
            }
            // Animation libraries
            if (id.includes('framer-motion') || id.includes('lottie') || id.includes('gsap')) {
              return 'animation-vendor';
            }
            // HTTP/API libraries
            if (id.includes('axios') || id.includes('fetch')) {
              return 'http-vendor';
            }
            // Split remaining vendors by first letter for better distribution
            const packageName = id.split('node_modules/')[1]?.split('/')[0] || '';
            const firstChar = packageName.charAt(0).toLowerCase();
            if (firstChar >= 'a' && firstChar <= 'f') {
              return 'vendor-a-f';
            }
            if (firstChar >= 'g' && firstChar <= 'l') {
              return 'vendor-g-l';
            }
            if (firstChar >= 'm' && firstChar <= 'r') {
              return 'vendor-m-r';
            }
            if (firstChar >= 's' && firstChar <= 'z') {
              return 'vendor-s-z';
            }
            return 'vendor-misc';
          }
          // App code chunking
          if (id.includes('src/components/face-auth')) {
            return 'face-components';
          }
          if (id.includes('src/components/student-records')) {
            return 'student-components';
          }
          if (id.includes('src/components/placement')) {
            return 'placement-components';
          }
        }
      }
    },
    chunkSizeWarningLimit: 3000
  }
});
