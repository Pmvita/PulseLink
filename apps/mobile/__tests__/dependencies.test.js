/**
 * Dependency Verification Tests
 * Ensures all required dependencies are installed and accessible
 */

const path = require('path');
const fs = require('fs');

describe('Dependency Verification', () => {
  const projectRoot = __dirname.replace(/__tests__$/, '');
  const workspaceRoot = path.resolve(projectRoot, '../..');

  test('React and React DOM are installed', () => {
    const reactPath = path.join(workspaceRoot, 'node_modules', 'react', 'package.json');
    const reactDomPath = path.join(workspaceRoot, 'node_modules', 'react-dom', 'package.json');
    
    expect(fs.existsSync(reactPath)).toBe(true);
    expect(fs.existsSync(reactDomPath)).toBe(true);
    
    const reactPkg = JSON.parse(fs.readFileSync(reactPath, 'utf8'));
    const reactDomPkg = JSON.parse(fs.readFileSync(reactDomPath, 'utf8'));
    
    expect(reactPkg.version).toBe('19.1.0');
    expect(reactDomPkg.version).toBe('19.1.0');
  });

  test('React Native is installed with required files', () => {
    const rnPath = path.join(workspaceRoot, 'node_modules', 'react-native');
    const polyfillsPath = path.join(rnPath, 'rn-get-polyfills.js');
    
    expect(fs.existsSync(rnPath)).toBe(true);
    expect(fs.existsSync(polyfillsPath)).toBe(true);
    
    const rnPkg = JSON.parse(fs.readFileSync(path.join(rnPath, 'package.json'), 'utf8'));
    expect(rnPkg.version).toBe('0.81.5');
  });

  test('react-native-svg is installed', () => {
    const svgPath = path.join(workspaceRoot, 'node_modules', 'react-native-svg', 'package.json');
    expect(fs.existsSync(svgPath)).toBe(true);
    
    const svgPkg = JSON.parse(fs.readFileSync(svgPath, 'utf8'));
    expect(svgPkg.version).toMatch(/^15\./);
  });

  test('Expo SDK 54 is installed', () => {
    const expoPath = path.join(workspaceRoot, 'node_modules', 'expo', 'package.json');
    expect(fs.existsSync(expoPath)).toBe(true);
    
    const expoPkg = JSON.parse(fs.readFileSync(expoPath, 'utf8'));
    expect(expoPkg.version).toMatch(/^54\./);
  });

  test('All package.json dependencies match expected versions', () => {
    const mobilePkgPath = path.join(projectRoot, 'package.json');
    const mobilePkg = JSON.parse(fs.readFileSync(mobilePkgPath, 'utf8'));
    
    expect(mobilePkg.dependencies.react).toBe('19.1.0');
    expect(mobilePkg.dependencies['react-dom']).toBe('19.1.0');
    expect(mobilePkg.dependencies['react-native']).toBe('0.81.5');
    expect(mobilePkg.dependencies['react-native-worklets']).toBe('0.5.1');
    expect(mobilePkg.dependencies['react-native-svg']).toBe('~15.8.0');
    expect(mobilePkg.devDependencies['@types/react']).toBe('~19.1.10');
    expect(mobilePkg.devDependencies['@types/react-dom']).toBe('~19.1.7');
  });

  test('Critical dependencies can be required', () => {
    // Test that we can require React Native from workspace root
    const resolveFrom = require('resolve-from');
    const rnPkgPath = resolveFrom.silent(projectRoot, 'react-native/package.json');
    expect(rnPkgPath).toBeTruthy();
    expect(rnPkgPath).toContain('react-native');
  });
});

