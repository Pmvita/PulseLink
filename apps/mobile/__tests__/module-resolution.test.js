/**
 * Module Resolution Tests
 * Verifies that critical modules can be resolved correctly in workspace setup
 */

const path = require('path');
const resolveFrom = require('resolve-from');

describe('Module Resolution', () => {
  const projectRoot = __dirname.replace(/__tests__$/, '');

  const criticalModules = [
    'react',
    'react-dom',
    'react-native',
    'react-native-svg',
    'expo',
    'expo-router',
    'lucide-react-native',
    'zustand',
  ];

  criticalModules.forEach(moduleName => {
    test(`can resolve ${moduleName}`, () => {
      const modulePath = resolveFrom.silent(projectRoot, moduleName);
      expect(modulePath).toBeTruthy();
      expect(typeof modulePath).toBe('string');
    });
  });

  test('can resolve React Native specific files', () => {
    const rnPkg = resolveFrom.silent(projectRoot, 'react-native/package.json');
    const rnPolyfills = resolveFrom.silent(projectRoot, 'react-native/rn-get-polyfills');
    
    expect(rnPkg).toBeTruthy();
    expect(rnPolyfills).toBeTruthy();
  });

  test('can resolve lucide-react-native which requires react-native-svg', () => {
    const lucidePath = resolveFrom.silent(projectRoot, 'lucide-react-native');
    expect(lucidePath).toBeTruthy();
    
    // Verify react-native-svg is also resolvable from the same context
    const svgPath = resolveFrom.silent(projectRoot, 'react-native-svg');
    expect(svgPath).toBeTruthy();
  });
});

