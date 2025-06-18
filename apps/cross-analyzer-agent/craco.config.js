const path = require('path');

// Resolve the absolute path to the shared packages directory.
const packagesPath = path.join(__dirname, '../../packages');

module.exports = {
  // Add the style block to configure PostCSS for Tailwind CSS.
  style: {
    postcssOptions: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    alias: {},
    plugins: [],
    configure: (webpackConfig) => {
      // Find the existing babel-loader rule.
      const babelLoaderRule = webpackConfig.module.rules.find(
        (rule) =>
          rule.oneOf &&
          rule.oneOf.find((oneOfRule) =>
            oneOfRule.loader && oneOfRule.loader.includes('babel-loader')
          )
      );
      
      if (babelLoaderRule) {
        const babelLoader = babelLoaderRule.oneOf.find((oneOfRule) => 
            oneOfRule.loader && oneOfRule.loader.includes('babel-loader')
        );
        
        // The original configuration only includes the `src` directory.
        const include = Array.isArray(babelLoader.include)
          ? babelLoader.include
          : [babelLoader.include];
        
        // We add the entire `packages` directory to the list of paths
        // that Babel should transpile. This ensures that all our shared
        // packages (@amc-platfrom/shared-contexts, @amc-platfrom/shared-components, etc.)
        // are correctly processed.
        babelLoader.include = [...include, packagesPath];
      }
      
      return webpackConfig;
    },
  },
};
