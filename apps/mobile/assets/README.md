# Assets

This directory contains the image assets for the PulseLink Expo app.

## Required Assets

- `icon.png` (1024x1024) - App icon
- `splash.png` (1284x2778) - Splash screen  
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `favicon.png` (48x48) - Web favicon

## Generating Placeholder Assets

For development, minimal placeholder assets have been created. To regenerate them:

```bash
npm run generate-assets
```

## Production Assets

For production, you should replace these with proper branded assets:

1. **Use Expo's Asset Generator:**
   - Visit [Expo's asset generator](https://docs.expo.dev/guides/app-icons/)
   - Upload your app icon and it will generate all required sizes

2. **Manual Creation:**
   - Use any image editing tool (Figma, Photoshop, etc.)
   - Follow the sizes listed above
   - Use PulseLink brand colors: Primary `#3B82F6`, Background `#000000`

3. **Design Guidelines:**
   - Keep icons simple and recognizable at small sizes
   - Use the lightning bolt ⚡ as the main icon element
   - Ensure good contrast for accessibility
   - Test on both light and dark mode backgrounds

