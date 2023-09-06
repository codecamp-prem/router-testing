import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./test-setup/setupTests.js",
  },
  //define: process.env.VITEST ? {} : { global: "window" },
});