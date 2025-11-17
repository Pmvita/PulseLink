const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Ensure workspace root is watched for changes
config.watchFolders = [workspaceRoot];

// Properly merge resolver config to ensure workspace node_modules are resolved
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ],
  // Enable package exports and prefer CommonJS to avoid import.meta issues
  unstable_enablePackageExports: true,
  unstable_conditionNames: ["react-native", "require", "browser", "node", "import", "default"],
};

module.exports = withNativeWind(config, { input: "./global.css" });
