# 🏁 Trackmania Signpack Generator

**Create custom checkpoint signs for Trackmania!** Free, web-based tool with 60+ fonts, special effects, templates, and community sharing features.

[![GitHub Stars](https://img.shields.io/github/stars/Sonaclov/TrackmaniaSignpacks?style=social)](https://github.com/Sonaclov/TrackmaniaSignpacks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

### 🎨 Design Tools
- **60+ Fonts** - From classic to futuristic styles
- **6 Special Effects** - Hologram, Neon, Metallic, Chrome, Rainbow, Glitch
- **Custom Backgrounds** - Solid, gradients, patterns, noise, or upload your own image
- **Text Effects** - Shadows, outlines, glow, skew, spacing
- **Border Styles** - Multiple styles with custom colors and corner radius
- **Real-time Preview** - See changes instantly

### 🚀 Community Features
- **Quick Templates** - 10 pre-built styles for common use cases
- **Share Links** - One-click shareable URLs for your designs
- **Discord Integration** - Post designs directly to Discord servers
- **Preset System** - Save and load your favorite designs
- **Theme Library** - 8 built-in themes to get started quickly

### ⚙️ Power User Tools
- **Batch Generation** - Create 1-999 checkpoints at once
- **Smart Randomizer** - Generate random designs with lockable settings
- **Export Options** - PNG files + optional settings JSON
- **URL Import** - Load shared designs from community

## 🎯 Quick Start

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

### Discord Integration

**Post designs directly to Discord:**

1. Click "Discord" button in toolbar
2. Set up your webhook (one-time setup):
   - Discord Server Settings → Integrations → Webhooks
   - Create webhook and copy URL
   - Paste in the tool
3. Now you can share designs with one click!

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
- ❌ IE11 (not supported)

**Minimum Requirements:**
- ES6 module support
- Canvas API support
- LocalStorage for presets

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Report Bugs
[Open an issue](https://github.com/Sonaclov/TrackmaniaSignpacks/issues) with:
- Browser and version
- Steps to reproduce
- Screenshots if relevant

### Suggest Features
[Start a discussion](https://github.com/Sonaclov/TrackmaniaSignpacks/discussions) about:
- New effects or features
- Template ideas
- UX improvements

### Add Templates
Create a template and share it! Format:

```javascript
"Your Template Name": {
    description: "What makes it special",
    icon: "🎨",
    category: "racing", // or neon, clan, professional, etc.
    difficulty: "beginner",
    settings: {
        // Your settings here
    },
    customizable: ['textPrefix', 'textColor'],
    instructions: "How to customize it"
}
```

Submit via [Pull Request](https://github.com/Sonaclov/TrackmaniaSignpacks/pulls).

### Code Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code Style:**
- Use ES6+ features
- Add JSDoc comments for functions
- Keep functions small and focused
- Follow existing patterns

## 📝 Development Roadmap

### Version 2.0 (Current) ✅
- [x] Modular architecture
- [x] Input validation
- [x] Community templates
- [x] Share link system
- [x] Discord integration
- [x] Performance improvements (debouncing)
- [x] Security improvements (SRI hashes)

### Version 2.1 (Planned) 🎯
- [ ] Community gallery (GitHub-backed)
- [ ] Installation wizard
- [ ] Mobile optimization
- [ ] URL list generator
- [ ] Team pack mode
- [ ] Color variation generator

### Version 3.0 (Future) 🚀
- [ ] Web Workers for generation
- [ ] TypeScript migration
- [ ] Unit test suite
- [ ] CI/CD pipeline
- [ ] PWA support
- [ ] Offline mode

## 🎮 Community

- **Discord**: [Join our community](#) *(Add your Discord link)*
- **Reddit**: [r/TrackMania](https://reddit.com/r/TrackMania)
- **GitHub Discussions**: [Share & discuss](https://github.com/Sonaclov/TrackmaniaSignpacks/discussions)

### Showcase

Share your creations! Tag with `#TrackmaniaSignpacks` on social media.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Trackmania Community** - For inspiration and feedback
- **Ubisoft Nadeo** - For creating Trackmania
- **Google Fonts** - For the amazing font library
- **Contributors** - Everyone who has helped improve this tool

## 📧 Support

Need help? Found a bug?

1. Check the [FAQ](#faq) below
2. Search [existing issues](https://github.com/Sonaclov/TrackmaniaSignpacks/issues)
3. Create a [new issue](https://github.com/Sonaclov/TrackmaniaSignpacks/issues/new)

---

## ❓ FAQ

### How do I use the generated signs in Trackmania?

1. Upload your PNG files to a web host (Dashmap.live recommended)
2. In Trackmania Map Editor, place a checkpoint sign block
3. Right-click → Properties → Enter your image URL
4. Repeat for each checkpoint number

### Can other players see my custom signs?

Yes! But only if:
- Your PNG files are hosted on a public web server
- You use the URLs (not local file paths) in the map editor

Local files work for you as the creator, but other players need web-hosted URLs.

### How do I share my design?

Click the "Share" button → Copy the link → Share anywhere!
Others can click it to load your exact design settings.

### Why aren't fonts loading?

- Check your internet connection
- Try refreshing the page
- Some fonts may be blocked by ad blockers
- Disable browser extensions and try again

### Can I use this offline?

The app needs internet for:
- Loading Google Fonts
- Loading JSZip library
- Sharing features

Basic functionality works offline if fonts are cached.

### How do I add my own template?

1. Design your checkpoint
2. Click "Export Settings"
3. Format as shown in [Contributing](#contributing) section
4. Submit via Pull Request or share in Discussions

### The generator is slow for 100+ signs?

This is normal. Tips:
- Use smaller ranges (25-50 at a time)
- Close other browser tabs
- Wait patiently - it's generating high-quality PNGs!
- Future update will use Web Workers for better performance

### Can I use this commercially?

Yes! MIT License allows commercial use. Attribution appreciated but not required.

### How do I report a security issue?

Please email security concerns privately rather than opening a public issue.

---

**Made with ❤️ by the Trackmania Community**

⭐ Star this repo if you find it useful!

🔗 Share your creations with `#TrackmaniaSignpacks`
