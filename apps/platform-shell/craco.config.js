const path = require('path');
const { getLoader, loaderByName } = require('@craco/craco');

// Get the absolute path to the 'cross-analyzer-agent' package.
// This tells our config where to find the other app's source code.
const crossAnalyzerAgentPath = path.join(__dirname, '../cross-analyzer-agent');

module.exports = {
  webpack: {
    alias: {},
    plugins: [],
    configure: (webpackConfig) => {
      // Find the Babel loader in the webpack configuration.
      const { isFound, match } = getLoader(webpackConfig, loaderByName('babel-loader'));
      
      if (isFound) {
        const include = Array.isArray(match.loader.include)
          ? match.loader.include
          : [match.loader.include];
        
        // Add the path to 'cross-analyzer-agent' to the list of directories
        // that Babel is allowed to process. This is the key part of the fix.
        match.loader.include = [...include, crossAnalyzerAgentPath];
      }
      
      return webpackConfig;
    },
  },
};
