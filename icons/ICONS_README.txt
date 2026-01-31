Icon Files Needed
=================

This extension requires icon files in PNG format. You can either:

1. Use the provided icon.svg and convert it to PNG sizes:
   - icon16.png (16x16 pixels)
   - icon48.png (48x48 pixels)
   - icon128.png (128x128 pixels)

2. Use an online SVG to PNG converter:
   - https://cloudconvert.com/svg-to-png
   - https://svgtopng.com/

3. Use ImageMagick (if installed):
   convert icon.svg -resize 16x16 icon16.png
   convert icon.svg -resize 48x48 icon48.png
   convert icon.svg -resize 128x128 icon128.png

4. Create your own icons with any image editor (GIMP, Photoshop, etc.)

For development/testing, you can temporarily comment out the "icons" sections
in manifest.json if you don't have icon files yet.
