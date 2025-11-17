/**
 * Metro Configuration Tests
 * Verifies Metro bundler configuration is correct for workspace setup
 */

const path = require('path');
const fs = require('fs');

describe('Metro Configuration', () => {
  const projectRoot = __dirname.replace(/__tests__$/, '');
  const workspaceRoot = path.resolve(projectRoot, '../..');

  test('metro.config.js exists and is valid', () => {
    const metroConfigPath = path.join(projectRoot, 'metro.config.js');
    expect(fs.existsSync(metroConfigPath)).toBe(true);
    
    // Verify it can be required without errors
    expect(() => {
      require(metroConfigPath);
    }).not.toThrow();
  });

  test('Metro config exports valid configuration', () => {
    const metroConfig = require(path.join(projectRoot, 'metro.config.js'));
    
    expect(metroConfig).toBeDefined();
    expect(metroConfig.watchFolders).toBeDefined();
    expect(Array.isArray(metroConfig.watchFolders)).toBe(true);
    expect(metroConfig.watchFolders).toContain(workspaceRoot);
    
    expect(metroConfig.resolver).toBeDefined();
    expect(metroConfig.resolver.nodeModulesPaths).toBeDefined();
    expect(Array.isArray(metroConfig.resolver.nodeModulesPaths)).toBe(true);
    expect(metroConfig.resolver.nodeModulesPaths).toContain(
      path.join(workspaceRoot, 'node_modules')
    );
  });

  test('Metro can resolve React Native polyfills', () => {
    const resolveFrom = require('resolve-from');
    const rnPolyfillsPath = resolveFrom.silent(
      projectRoot,
      'react-native/rn-get-polyfills'
    );
    
    expect(rnPolyfillsPath).toBeTruthy();
    expect(fs.existsSync(rnPolyfillsPath)).toBe(true);
  });

  test('Metro can resolve react-native-svg', () => {
    const resolveFrom = require('resolve-from');
    const svgPath = resolveFrom.silent(
      projectRoot,
      'react-native-svg'
    );
    
    expect(svgPath).toBeTruthy();
    expect(fs.existsSync(svgPath)).toBe(true);
  });
});

