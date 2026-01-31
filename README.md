# ComfyUI Prompt Generator - Chrome Extension

A powerful Chrome extension that generates AI-powered prompts for ComfyUI using LM Studio. Create detailed, high-quality prompts with just a click, or guide the AI to generate exactly what you need.

## Features

- **AI-Powered Prompt Generation**: Uses LM Studio's local LLM models to generate creative and detailed prompts
- **Random or Guided Generation**: Choose between completely random prompts or provide your own guidance
- **Multiple Styles**: Select from various styles including Realistic, Artistic, Anime, Fantasy, Sci-Fi, Portrait, and Landscape
- **Auto-Detection**: Automatically finds and fills positive and negative prompt fields in ComfyUI
- **Persistent Settings**: All configurations are saved and persist across browser restarts
- **Easy Configuration**: Simple UI to configure your LM Studio instance and select models

## Prerequisites

1. **LM Studio**: Download and install [LM Studio](https://lmstudio.ai/)
2. **A Local LLM Model**: Download a model in LM Studio (recommended: Mistral, Llama 2, or similar)
3. **ComfyUI**: Have ComfyUI running (web interface)

## Installation

### Step 1: Download the Extension

Clone or download this repository:

```bash
git clone https://github.com/nahcmon/Prompt-Generator-for-ComfyUI-Web-Interface.git
cd Prompt-Generator-for-ComfyUI-Web-Interface
```

### Step 2: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right corner)
3. Click "Load unpacked"
4. Select the folder containing the extension files
5. The extension should now appear in your extensions list

### Step 3: Pin the Extension (Optional)

Click the puzzle piece icon in Chrome's toolbar and pin the "ComfyUI Prompt Generator" extension for easy access.

## Setup

### 1. Start LM Studio Server

1. Open LM Studio
2. Load a model (e.g., Mistral, Llama 2, etc.)
3. Go to the "Local Server" tab
4. Click "Start Server"
5. Note the server URL (usually `http://localhost:1234/v1`)

### 2. Configure the Extension

1. Click the extension icon in Chrome
2. Enter your LM Studio URL (default: `http://localhost:1234/v1`)
3. Click "Refresh Models" to load available models
4. Select your preferred model from the dropdown
5. Click "Save Configuration"

Your settings will be automatically saved and remembered for future use!

## Usage

### Basic Usage

1. Open ComfyUI in your browser
2. Click the extension icon
3. Select generation type:
   - **Random Prompt**: Generates a completely random prompt based on the selected style
   - **Guided Prompt**: Uses your input to guide the AI in generating a specific prompt
4. Choose a style (Realistic, Artistic, Anime, etc.)
5. Click "Generate & Insert Prompt"
6. The extension will automatically detect and fill the prompt fields in ComfyUI!

### Guided Generation

For more control over the generated prompts:

1. Select "Guided Prompt" from the Generation Type dropdown
2. Enter your description in the "Your Guidance" text area
   - Example: "a cyberpunk cat wearing neon sunglasses in a rainy city"
3. Select your preferred style
4. Click "Generate & Insert Prompt"

The AI will use your guidance to create a detailed, optimized prompt.

### Generated Prompts

The extension generates both:
- **Positive Prompt**: Detailed description of what you want in the image
- **Negative Prompt**: Elements to avoid (low quality, artifacts, etc.)

Both prompts are automatically inserted into the appropriate fields in ComfyUI.

## Features in Detail

### Auto-Detection of Prompt Fields

The extension intelligently searches for prompt fields using multiple strategies:
- Looks for textareas and inputs with labels containing "positive" or "negative"
- Checks placeholder text, names, IDs, and ARIA labels
- Detects ComfyUI-specific widget structures
- Falls back to position-based detection for complex interfaces

### Persistent Configuration

All your settings are saved using Chrome's sync storage:
- LM Studio URL
- Selected model
- Preferred prompt type
- Preferred style

These settings persist across:
- Browser restarts
- Extension reloads
- Different devices (if Chrome sync is enabled)

### Multiple Style Presets

Choose from various optimized style presets:
- **Realistic**: Photorealistic images, portraits, landscapes
- **Artistic**: Abstract, impressionist, and artistic compositions
- **Anime**: Anime and manga-style illustrations
- **Fantasy**: Magical creatures, enchanted realms, mythical scenes
- **Sci-Fi**: Futuristic, cyberpunk, space-themed images
- **Portrait**: Character studies, headshots, fashion photography
- **Landscape**: Natural scenes, vistas, environments

## Troubleshooting

### Extension Can't Connect to LM Studio

- Verify LM Studio server is running
- Check the URL is correct (should end with `/v1`)
- Ensure no firewall is blocking the connection
- Try `http://127.0.0.1:1234/v1` instead of `localhost`

### No Models Showing Up

- Make sure you've downloaded models in LM Studio
- Verify the model is loaded in LM Studio
- Try clicking "Refresh Models" again
- Check the browser console for error messages (F12 → Console)

### Prompts Not Being Inserted

- Ensure you're on a page with ComfyUI loaded
- Try manually clicking on the prompt field first
- Check the browser console for any errors
- The extension works best with standard ComfyUI interfaces

### Icons Not Showing

If you see missing icon warnings:
- The extension includes placeholder icons
- For custom icons, see `icons/ICONS_README.txt`
- You can convert the included `icon.svg` to PNG formats
- Alternatively, comment out the "icons" sections in `manifest.json` for development

## Development

### Project Structure

```
.
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic and UI interactions
├── styles.css            # Popup styling
├── background.js         # Background service worker (LM Studio API)
├── content.js            # Content script (ComfyUI interaction)
├── icons/                # Extension icons
│   ├── icon.svg         # Source SVG icon
│   ├── icon16.png       # 16x16 icon
│   ├── icon48.png       # 48x48 icon
│   └── icon128.png      # 128x128 icon
└── README.md            # This file
```

### Modifying the Extension

After making changes:
1. Go to `chrome://extensions/`
2. Click the refresh icon on the extension card
3. Reload any pages where you're testing

### API Integration

The extension uses the OpenAI-compatible API format that LM Studio provides:
- Endpoint: `{lmStudioUrl}/chat/completions`
- Method: POST
- Format: Standard OpenAI chat completion format

## Privacy & Security

- All data stays local - prompts are generated using your local LM Studio instance
- No data is sent to external servers
- Settings are stored locally in Chrome's storage
- The extension only has access to pages you explicitly use it on

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use and modify as needed.

## Credits

Created for the ComfyUI community to enhance the prompt generation workflow.

## Support

If you encounter any issues or have suggestions:
- Open an issue on GitHub
- Check the browser console for error messages
- Ensure you're using the latest version of the extension

---

**Enjoy creating amazing prompts with AI assistance!**
