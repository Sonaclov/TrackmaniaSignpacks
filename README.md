# Trackmania Signpack Generator

**Create custom checkpoint signs for Trackmania!** Free, web-based tool with 60+ fonts, special effects, templates, and community sharing features.

[![GitHub Stars](https://img.shields.io/github/stars/Sonaclov/TrackmaniaSignpacks?style=social)](https://github.com/Sonaclov/TrackmaniaSignpacks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

##  Features

### Design Tools
- **60+ Fonts** - From classic to futuristic styles
- **6 Special Effects** - Hologram, Neon, Metallic, Chrome, Rainbow, Glitch
- **Custom Backgrounds** - Solid, gradients, patterns, noise, or upload your own image
- **Text Effects** - Shadows, outlines, glow, skew, spacing
- **Border Styles** - Multiple styles with custom colors and corner radius
- **Real-time Preview** - See changes instantly

### Community Features
- **Quick Templates** - 10 pre-built styles for common use cases
- **Share Links** - One-click shareable URLs for your designs
- **Discord Integration** - Post designs directly to Discord servers
- **Preset System** - Save and load your favorite designs
- **Theme Library** - 8 built-in themes to get started quickly

### Power User Tools
- **Batch Generation** - Create 1-999 checkpoints at once
- **Smart Randomizer** - Generate random designs with lockable settings
- **Export Options** - PNG files + optional settings JSON
- **URL Import** - Load shared designs from community

## Quick Start

### Online Version (Recommended)
Just visit: [https://sonaclov.github.io/TrackmaniaSignpacks/](https://sonaclov.github.io/TrackmaniaSignpacks/)

No installation required! Works in any modern browser.

### Local Development

```bash
# Clone the repository
git clone https://github.com/Sonaclov/TrackmaniaSignpacks.git
cd TrackmaniaSignpacks

# Open in browser (no build step needed!)
# Just open index.html in your browser
# Or use a simple HTTP server:
python -m http.server 8000
# Then visit http://localhost:8000
```

## 📖 Usage Guide

### Creating Your First Signpack

1. **Choose a Template** (optional)
   - Click "Templates" in the toolbar
   - Pick a pre-made style or start from scratch

2. **Customize Your Design**
   - Adjust text, colors, fonts, and effects
   - Use the live preview to see changes instantly

3. **Generate Signs**
   - Set your checkpoint range (e.g., 1-100)
   - Click "Generate Signpack"
   - Download the ZIP file

4. **Use in Trackmania**
   - Upload PNG files to a web host ([Dashmap.live](https://dashmap.live) recommended)
   - Use the URLs in Trackmania Map Editor
   - Place checkpoint blocks and add your custom URLs

### Sharing Your Design

1. Click the "Share" button in the toolbar
2. Copy the share link
3. Post on Discord, Reddit, or Twitter
4. Others can click your link to load your exact design!

## 🛠️ Technical Details

### Architecture

The project uses a **modular ES6 architecture**:

```
TrackmaniaSignpacks/
├── index.html              # Main application UI
├── script.js               # Core application logic
├── src/
│   ├── constants.js        # Configuration & constants
│   ├── utils.js            # Utility functions
│   ├── validation.js       # Input validation & error handling
│   ├── templates.js        # Community templates
│   └── sharing.js          # Share links & Discord integration
└── README.md
```

### Tech Stack

- **Vanilla JavaScript (ES6+)** - No framework dependencies
- **HTML5 Canvas API** - For rendering signs
- **JSZip** - ZIP file generation
- **Google Fonts API** - Font loading
- **Font Awesome** - UI icons

### Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari

**Minimum Requirements:**
- ES6 module support
- Canvas API support
- LocalStorage for presets

## Contributing

Contributions are welcome! Here's how you can help:

### Report Bugs
[Open an issue](https://github.com/Sonaclov/TrackmaniaSignpacks/issues) with:
- Browser and version
- Steps to reproduce
- Screenshots if relevant

## Community

- **Discord**: [Join our community](#) *(Add your Discord link)*
- **Reddit**: [r/TrackMania](https://reddit.com/r/TrackMania)
- **GitHub Discussions**: [Share & discuss](https://github.com/Sonaclov/TrackmaniaSignpacks/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## FAQ

### Can other players see my custom signs?

Yes! But only if:
- Your PNG files are hosted on a public web server
- You use the URLs (not local file paths) in the map editor

Local files work for you as the creator, but other players need web-hosted URLs.

### How do I share my design?

Click the "Share" button → Copy the link → Share anywhere!
Others can click it to load your exact design settings.

### Why aren't fonts loading?

- Try refreshing the page
- Some fonts may be blocked by ad blockers
- Disable browser extensions and try again

### How do I report a security issue?

Please email security concerns privately rather than opening a public issue.
