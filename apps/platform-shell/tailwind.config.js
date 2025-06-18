const path = require('path');

module.exports = {
  content: [
    // Scan all files in the local src directory
    "./src/**/*.{js,jsx,ts,tsx}",

    // IMPORTANT: Scan the shared components package for Tailwind classes
    // This uses a relative path to go up two directories from the app,
    // then into the packages directory.
    path.resolve(__dirname, '../../packages/shared-components/src/**/*.{js,jsx,ts,tsx}'),
  ],
  theme: {
    extend: {
        // You can extend the default theme here if needed in the future
    },
  },
  plugins: [],
}