/**
 * Trackmania Signpack Generator - Main Application
 * v2.0 - Enhanced with modular architecture and community themes
 */

class TrackmaniaSignpackGenerator {
    constructor() {
        console.log('TrackmaniaSignpackGenerator constructor called (v2.0)');

        // Check if required DOM elements exist
        const requiredElements = ['previewCanvas1', 'previewCanvasStart', 'previewCanvasArrow', 'previewCanvasFinish'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));

        if (missingElements.length > 0) {
            console.warn(`Missing preview canvases: ${missingElements.join(', ')}`);
        }

        this.canvases = {
            cp1: document.getElementById('previewCanvas1'),
            start: document.getElementById('previewCanvasStart'),
            arrow: document.getElementById('previewCanvasArrow'),
            finish: document.getElementById('previewCanvasFinish')
        };

        this.contexts = {
            cp1: this.canvases.cp1?.getContext('2d'),
            start: this.canvases.start?.getContext('2d'),
            arrow: this.canvases.arrow?.getContext('2d'),
            finish: this.canvases.finish?.getContext('2d')
        };

        // Check if contexts were created successfully
        const failedContexts = Object.entries(this.contexts)
            .filter(([key, ctx]) => !ctx)
            .map(([key]) => key);

        if (failedContexts.length > 0) {
            throw new Error(`Failed to create canvas contexts: ${failedContexts.join(', ')}`);
        }

        this.generatedZip = null;
        this.presets = this.loadPresets();
        this.backgroundImage = null;
        this.loadedFonts = new Set();
        this.initialized = false;
        this.lockedSettings = new Set(); // Track locked settings

        // Create debounced preview update for performance
        this.debouncedPreviewUpdate = this.debounce(() => {
            this.updatePreview();
            this.updateStats();
        }, 300);

        console.log('Initializing elements...');
        try {
            this.initializeElements();
        } catch (error) {
            console.warn('Some elements failed to initialize:', error);
        }

        console.log('Binding events...');
        try {
            this.bindEvents();
        } catch (error) {
            console.warn('Some events failed to bind:', error);
        }

        console.log('Initializing interface...');
        try {
            this.initializeInterface();
        } catch (error) {
            console.warn('Interface initialization had issues:', error);
        }

        console.log('Loading fonts...');
        this.loadFonts().then(() => {
            console.log('Fonts loaded, updating font dropdown...');
            this.updateFontDropdown(); // Filter to show only loaded fonts
            this.updatePreview();
            this.updateStats();
            this.initialized = true;

            // Enable the generate button
            const generateBtn = document.getElementById('generateBtn');
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Signpack';
            }

            console.log('Generator fully initialized and ready!');

        }).catch(error => {
            console.error('Error during font loading:', error);
            this.updateFontDropdown(); // Still update dropdown with whatever fonts loaded
            this.initialized = true; // Still mark as initialized so basic functions work

            // Enable the generate button even if fonts failed
            const generateBtn = document.getElementById('generateBtn');
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Signpack';
            }
        });
    }

    async loadFonts() {
        const fontList = [
            'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans', 'Lato',
            'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', 'Bungee', 'Impact', 'Anton', 'Oswald',
            'Press Start 2P', 'Black Ops One', 'Russo One', 'Racing Sans One', 'Staatliches', 'Bebas Neue',
            'Permanent Marker', 'Creepster', 'Nosifer', 'Monoton', 'Faster One', 'Alfa Slab One',
            'Righteous', 'Bangers', 'Fredoka One', 'Squada One', 'JetBrains Mono', 'Fira Code',
            'Share Tech Mono', 'Electrolize', 'Michroma', 'Iceland', 'Chakra Petch'
        ];

        // Add system fonts that are always available
        const systemFonts = ['Arial', 'Impact', 'Georgia', 'Verdana', 'Times New Roman', 'Courier New'];
        systemFonts.forEach(font => this.loadedFonts.add(font));

        if ('fonts' in document) {
            for (const fontFamily of fontList) {
                try {
                    await document.fonts.load(`16px "${fontFamily}"`);
                    this.loadedFonts.add(fontFamily);
                } catch (error) {
                    console.warn(`Failed to load font: ${fontFamily}`);
                }
            }
            console.log(`Loaded ${this.loadedFonts.size}/${fontList.length + systemFonts.length} fonts`);
        }

        // Fallback for browsers without Font Loading API
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    updateFontDropdown() {
        const fontSelect = document.getElementById('fontFamily');
        if (!fontSelect) {
            console.warn('Font dropdown not found');
            return;
        }

        const currentValue = fontSelect.value;

        // Get all options and filter to only show loaded fonts
        const allOptions = Array.from(fontSelect.querySelectorAll('option'));

        allOptions.forEach(option => {
            const fontFamily = option.value;
            // Keep system fonts and loaded fonts, hide others
            if (this.loadedFonts.has(fontFamily)) {
                option.style.display = '';
                option.disabled = false;
            } else {
                // Hide unloaded fonts
                option.style.display = 'none';
                option.disabled = true;
            }
        });

        // If current selection wasn't loaded, switch to a loaded font
        if (!this.loadedFonts.has(currentValue) && this.loadedFonts.size > 0) {
            fontSelect.value = Array.from(this.loadedFonts)[0];
        }

        console.log(`Font dropdown updated: ${this.loadedFonts.size} fonts available`);
    }

    initializeElements() {
        this.elements = {
            // Text settings
            textPrefix: document.getElementById('textPrefix'),
            fontSize: document.getElementById('fontSize'),
            fontSizeValue: document.getElementById('fontSizeValue'),
            fontFamily: document.getElementById('fontFamily'),
            fontWeight: document.getElementById('fontWeight'),
            textColor: document.getElementById('textColor'),
            textTransform: document.getElementById('textTransform'),
            letterSpacing: document.getElementById('letterSpacing'),
            letterSpacingValue: document.getElementById('letterSpacingValue'),
            textSkew: document.getElementById('textSkew'),
            textSkewValue: document.getElementById('textSkewValue'),
            textHorizontalAlign: document.getElementById('textHorizontalAlign'),
            textVerticalAlign: document.getElementById('textVerticalAlign'),

            // Background settings
            backgroundType: document.getElementById('backgroundType'),
            backgroundColor: document.getElementById('backgroundColor'),
            gradientColor1: document.getElementById('gradientColor1'),
            gradientColor2: document.getElementById('gradientColor2'),
            gradientAngle: document.getElementById('gradientAngle'),
            gradientAngleValue: document.getElementById('gradientAngleValue'),
            patternType: document.getElementById('patternType'),
            patternColor: document.getElementById('patternColor'),
            patternSize: document.getElementById('patternSize'),
            patternSizeValue: document.getElementById('patternSizeValue'),
            noiseIntensity: document.getElementById('noiseIntensity'),
            noiseIntensityValue: document.getElementById('noiseIntensityValue'),
            noiseScale: document.getElementById('noiseScale'),
            noiseScaleValue: document.getElementById('noiseScaleValue'),
            backgroundImage: document.getElementById('backgroundImage'),
            imageOpacity: document.getElementById('imageOpacity'),
            imageOpacityValue: document.getElementById('imageOpacityValue'),
            imageBlendMode: document.getElementById('imageBlendMode'),

            // Text effects
            textShadow: document.getElementById('textShadow'),
            shadowColor: document.getElementById('shadowColor'),
            shadowBlur: document.getElementById('shadowBlur'),
            shadowBlurValue: document.getElementById('shadowBlurValue'),
            shadowOffsetX: document.getElementById('shadowOffsetX'),
            shadowOffsetXValue: document.getElementById('shadowOffsetXValue'),
            shadowOffsetY: document.getElementById('shadowOffsetY'),
            shadowOffsetYValue: document.getElementById('shadowOffsetYValue'),
            textStroke: document.getElementById('textStroke'),
            strokeColor: document.getElementById('strokeColor'),
            strokeWidth: document.getElementById('strokeWidth'),
            strokeWidthValue: document.getElementById('strokeWidthValue'),
            textGlow: document.getElementById('textGlow'),
            glowColor: document.getElementById('glowColor'),
            glowIntensity: document.getElementById('glowIntensity'),
            glowIntensityValue: document.getElementById('glowIntensityValue'),

            // Special effects
            hologram: document.getElementById('hologram'),
            neon: document.getElementById('neon'),
            metallic: document.getElementById('metallic'),
            chrome: document.getElementById('chrome'),
            rainbow: document.getElementById('rainbow'),
            glitch: document.getElementById('glitch'),
            effectIntensity: document.getElementById('effectIntensity'),
            effectIntensityValue: document.getElementById('effectIntensityValue'),

            // Border settings
            borderWidth: document.getElementById('borderWidth'),
            borderWidthValue: document.getElementById('borderWidthValue'),
            borderColor: document.getElementById('borderColor'),
            borderStyle: document.getElementById('borderStyle'),
            cornerRadius: document.getElementById('cornerRadius'),
            cornerRadiusValue: document.getElementById('cornerRadiusValue'),

            // Sign format
            signFormat: document.getElementById('signFormat'),

            // Pack configuration
            includeCheckpoints: document.getElementById('includeCheckpoints'),
            checkpointPrefix: document.getElementById('checkpointPrefix'),
            cpStartNumber: document.getElementById('cpStartNumber'),
            cpEndNumber: document.getElementById('cpEndNumber'),
            includeStart: document.getElementById('includeStart'),
            startText: document.getElementById('startText'),
            includeFinish: document.getElementById('includeFinish'),
            finishText: document.getElementById('finishText'),
            includeArrows: document.getElementById('includeArrows'),
            arrowMode: document.getElementById('arrowMode'),
            arrowDirections: document.getElementById('arrowDirections'),
            arrowUp: document.getElementById('arrowUp'),
            arrowDown: document.getElementById('arrowDown'),
            arrowLeft: document.getElementById('arrowLeft'),
            arrowRight: document.getElementById('arrowRight'),
            arrowUpLeft: document.getElementById('arrowUpLeft'),
            arrowUpRight: document.getElementById('arrowUpRight'),
            arrowDownLeft: document.getElementById('arrowDownLeft'),
            arrowDownRight: document.getElementById('arrowDownRight'),
            packName: document.getElementById('packName'),
            filePrefix: document.getElementById('filePrefix'),
            includeSettingsJSON: document.getElementById('includeSettingsJSON'),

            // Lock buttons
            lockFontFamily: document.getElementById('lockFontFamily'),
            lockTextColor: document.getElementById('lockTextColor'),
            lockBackgroundType: document.getElementById('lockBackgroundType'),

            // Advanced tools (optional)
            batchOperation: document.getElementById('batchOperation'),

            // Preset management (optional)
            presetName: document.getElementById('presetName'),
            presetList: document.getElementById('presetList'),

            // Controls
            generateBtn: document.getElementById('generateBtn'),
            progressContainer: document.getElementById('progressContainer'),
            progressBar: document.getElementById('progressBar'),
            status: document.getElementById('status'),
            downloadSection: document.getElementById('downloadSection'),
            downloadBtn: document.getElementById('downloadBtn'),

            // Stats
            statFormat: document.getElementById('statFormat'),
            statFont: document.getElementById('statFont'),
            statEffects: document.getElementById('statEffects'),
            statBackground: document.getElementById('statBackground'),
            statFileSize: document.getElementById('statFileSize'),
            statTime: document.getElementById('statTime')
        };
    }

    bindEvents() {
        // Update preview on any setting change with performance optimization
        Object.values(this.elements).forEach(element => {
            if (element && (element.type !== 'button' && element.tagName !== 'DIV')) {
                // Use debounced update for text inputs and ranges (performance boost)
                if (element.type === 'text' || element.type === 'number' || element.type === 'range') {
                    element.addEventListener('input', () => {
                        this.debouncedPreviewUpdate();
                    });
                } else {
                    // Immediate update for other inputs
                    element.addEventListener('input', () => {
                        this.updatePreview();
                        this.updateStats();
                    });
                }

                // Immediate update on change events (checkboxes, selects, etc.)
                element.addEventListener('change', () => {
                    this.updatePreview();
                    this.updateStats();
                });
            }
        });

        // Range slider value updates
        this.setupRangeSliders();

        // Background type change
        this.elements.backgroundType.addEventListener('change', () => this.toggleBackgroundControls());

        // Pack configuration toggles
        this.setupPackConfiguration();

        // Lock button handlers
        this.setupLockButtons();

        // Effect toggles
        this.setupEffectToggles();

        // Special effect indicators
        this.setupEffectIndicators();

        // Background image upload
        this.elements.backgroundImage.addEventListener('change', (e) => this.handleImageUpload(e));

        // Generate and download buttons
        this.elements.generateBtn.addEventListener('click', () => this.generateSignpack());
        this.elements.downloadBtn.addEventListener('click', () => this.downloadSignpack());

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Initialize UI state
        this.toggleBackgroundControls();
        this.setupEffectToggles();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + G: Generate
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                e.preventDefault();
                if (!this.elements.generateBtn.disabled) {
                    this.generateSignpack();
                }
            }

            // R: Randomize (when not typing in input)
            if (e.key === 'r' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
                e.preventDefault();
                randomizeAll();
            }

            // Ctrl/Cmd + S: Save preset
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                savePreset();
            }

            // T: Toggle Themes modal
            if (e.key === 't' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
                e.preventDefault();
                toggleThemesModal();
            }

            // H or ?: Toggle Help modal
            if ((e.key === 'h' || e.key === '?') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
                e.preventDefault();
                toggleHelpModal();
            }

            // Escape: Close modals
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    if (modal.style.display !== 'none') {
                        modal.style.display = 'none';
                    }
                });
            }
        });
    }

    setupRangeSliders() {
        const sliders = [
            { id: 'fontSize', unit: 'px' },
            { id: 'gradientAngle', unit: '°' },
            { id: 'patternSize', unit: 'px' },
            { id: 'noiseIntensity', unit: '%' },
            { id: 'noiseScale', unit: 'x' },
            { id: 'imageOpacity', unit: '%' },
            { id: 'shadowBlur', unit: 'px' },
            { id: 'shadowOffsetX', unit: 'px' },
            { id: 'shadowOffsetY', unit: 'px' },
            { id: 'strokeWidth', unit: 'px' },
            { id: 'glowIntensity', unit: 'px' },
            { id: 'borderWidth', unit: 'px' },
            { id: 'cornerRadius', unit: 'px' },
            { id: 'letterSpacing', unit: 'px' },
            { id: 'textSkew', unit: '°' },
            { id: 'effectIntensity', unit: '' }
        ];

        sliders.forEach(({ id, unit }) => {
            const slider = this.elements[id];
            const valueDisplay = this.elements[id + 'Value'];
            if (slider && valueDisplay) {
                slider.addEventListener('input', () => {
                    valueDisplay.textContent = slider.value + unit;
                });
                // Initialize display
                valueDisplay.textContent = slider.value + unit;
            }
        });
    }

    setupPackConfiguration() {
        // Toggle config sections based on checkboxes
        const toggleConfig = (checkboxId, configId, displayType = 'block') => {
            const checkbox = document.getElementById(checkboxId);
            const config = document.getElementById(configId);
            if (checkbox && config) {
                checkbox.addEventListener('change', () => {
                    config.style.display = checkbox.checked ? displayType : 'none';
                    this.updatePackSummary();
                    this.updatePreview();
                });
                // Initialize
                config.style.display = checkbox.checked ? displayType : 'none';
            }
        };

        toggleConfig('includeCheckpoints', 'checkpointConfig', 'grid');
        toggleConfig('includeStart', 'startConfig', 'block');
        toggleConfig('includeFinish', 'finishConfig', 'block');
        toggleConfig('includeArrows', 'arrowConfig', 'grid');

        // Update pack summary on any pack config change
        const packConfigElements = [
            'includeCheckpoints', 'cpStartNumber', 'cpEndNumber',
            'includeStart', 'includeFinish', 'includeArrows',
            'arrowUp', 'arrowDown', 'arrowLeft', 'arrowRight',
            'arrowUpLeft', 'arrowUpRight', 'arrowDownLeft', 'arrowDownRight'
        ];

        packConfigElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.updatePackSummary());
                element.addEventListener('input', () => this.updatePackSummary());
            }
        });

        // Arrow mode change - update preview
        if (this.elements.arrowMode) {
            this.elements.arrowMode.addEventListener('change', () => {
                this.updatePreview();
            });
        }

        // Arrow directions selector - update checkboxes based on 4 or 8 directions
        if (this.elements.arrowDirections) {
            this.elements.arrowDirections.addEventListener('change', () => {
                this.updateArrowDirections();
                this.updatePackSummary();
            });
            // Initialize arrow directions on load
            this.updateArrowDirections();
        }

        // Initial pack summary
        this.updatePackSummary();
    }

    updateArrowDirections() {
        const directions = this.elements.arrowDirections?.value || '4';

        if (directions === '4') {
            // 4 directions: cardinal only
            this.elements.arrowUp.checked = true;
            this.elements.arrowDown.checked = true;
            this.elements.arrowLeft.checked = true;
            this.elements.arrowRight.checked = true;
            this.elements.arrowUpLeft.checked = false;
            this.elements.arrowUpRight.checked = false;
            this.elements.arrowDownLeft.checked = false;
            this.elements.arrowDownRight.checked = false;
        } else {
            // 8 directions: all
            this.elements.arrowUp.checked = true;
            this.elements.arrowDown.checked = true;
            this.elements.arrowLeft.checked = true;
            this.elements.arrowRight.checked = true;
            this.elements.arrowUpLeft.checked = true;
            this.elements.arrowUpRight.checked = true;
            this.elements.arrowDownLeft.checked = true;
            this.elements.arrowDownRight.checked = true;
        }
    }

    updatePackSummary() {
        const packList = document.getElementById('packList');
        const totalSigns = document.getElementById('totalSigns');
        if (!packList || !totalSigns) return;

        let items = [];
        let total = 0;

        // Checkpoints
        if (this.elements.includeCheckpoints?.checked) {
            const start = parseInt(this.elements.cpStartNumber?.value || 1);
            const end = parseInt(this.elements.cpEndNumber?.value || 100);
            const count = Math.max(0, end - start + 1);
            items.push(`Checkpoints: ${start}-${end} (${count} signs)`);
            total += count;
        }

        // Start
        if (this.elements.includeStart?.checked) {
            items.push('START sign (1 sign)');
            total += 1;
        }

        // Finish
        if (this.elements.includeFinish?.checked) {
            items.push('FINISH sign (1 sign)');
            total += 1;
        }

        // Arrows
        if (this.elements.includeArrows?.checked) {
            const arrows = [];
            if (this.elements.arrowUp?.checked) arrows.push('↑');
            if (this.elements.arrowDown?.checked) arrows.push('↓');
            if (this.elements.arrowLeft?.checked) arrows.push('←');
            if (this.elements.arrowRight?.checked) arrows.push('→');
            if (this.elements.arrowUpLeft?.checked) arrows.push('↖');
            if (this.elements.arrowUpRight?.checked) arrows.push('↗');
            if (this.elements.arrowDownLeft?.checked) arrows.push('↙');
            if (this.elements.arrowDownRight?.checked) arrows.push('↘');

            if (arrows.length > 0) {
                items.push(`Arrows: ${arrows.join(' ')} (${arrows.length} signs)`);
                total += arrows.length;
            }
        }

        // Update display
        if (items.length === 0) {
            packList.innerHTML = '<li style="color: var(--color-warning);">No sign types selected</li>';
        } else {
            packList.innerHTML = items.map(item => `<li>${item}</li>`).join('');
        }

        totalSigns.textContent = total;
    }

    setupEffectToggles() {
        const effects = ['textShadow', 'textStroke', 'textGlow'];
        const controls = ['shadowControls', 'strokeControls', 'glowControls'];

        effects.forEach((effect, index) => {
            const checkbox = this.elements[effect];
            const controlDiv = document.getElementById(controls[index]);

            if (checkbox && controlDiv) {
                checkbox.addEventListener('change', () => {
                    controlDiv.style.display = checkbox.checked ? 'block' : 'none';
                    this.updatePreview();
                });
                // Initialize display
                controlDiv.style.display = checkbox.checked ? 'block' : 'none';
            }
        });
    }

    setupEffectIndicators() {
        const effects = ['hologram', 'neon', 'metallic', 'chrome'];

        effects.forEach(effect => {
            const checkbox = this.elements[effect];
            const indicator = document.getElementById(effect + 'Indicator');

            if (checkbox && indicator) {
                checkbox.addEventListener('change', () => {
                    indicator.classList.toggle('active', checkbox.checked);
                    this.updatePreview();
                });
            }
        });
    }

    toggleBackgroundControls() {
        const type = this.elements.backgroundType.value;

        // Hide all option groups first
        const optionGroups = ['gradientOptions', 'patternOptions', 'noiseOptions', 'imageOptions', 'abstractOptions'];
        optionGroups.forEach(groupId => {
            const element = document.getElementById(groupId);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Show relevant options based on selection
        switch(type) {
            case 'linear':
            case 'radial':
            case 'conic':
                const gradientOptions = document.getElementById('gradientOptions');
                if (gradientOptions) gradientOptions.style.display = 'block';
                break;
            case 'pattern':
                const patternOptions = document.getElementById('patternOptions');
                if (patternOptions) patternOptions.style.display = 'block';
                break;
            case 'noise':
                const noiseOptions = document.getElementById('noiseOptions');
                if (noiseOptions) noiseOptions.style.display = 'block';
                break;
            case 'image':
                const imageOptions = document.getElementById('imageOptions');
                if (imageOptions) imageOptions.style.display = 'block';
                break;
            case 'abstract':
                const abstractOptions = document.getElementById('abstractOptions');
                if (abstractOptions) abstractOptions.style.display = 'block';
                break;
        }

        this.updatePreview();
    }


    setupLockButtons() {
        const lockButtons = [
            { button: 'lockFontFamily', setting: 'fontFamily' },
            { button: 'lockTextColor', setting: 'textColor' },
            { button: 'lockBackgroundType', setting: 'backgroundType' }
        ];

        lockButtons.forEach(({ button, setting }) => {
            if (this.elements[button]) {
                this.elements[button].addEventListener('click', () => {
                    this.toggleLock(setting, this.elements[button]);
                });
            }
        });
    }

    toggleLock(setting, button) {
        if (this.lockedSettings.has(setting)) {
            // Unlock
            this.lockedSettings.delete(setting);
            button.classList.remove('locked');
            button.innerHTML = '<i class="fas fa-lock-open"></i>';
            button.title = 'Lock from randomizer';
        } else {
            // Lock
            this.lockedSettings.add(setting);
            button.classList.add('locked');
            button.innerHTML = '<i class="fas fa-lock"></i>';
            button.title = 'Unlock from randomizer';
        }
    }

    // Weighted random selection
    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        return items[items.length - 1]; // fallback
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.backgroundImage = img;
                    this.updatePreview();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    initializeInterface() {
        // Initialize first three tool sections as open to show more tools
        const toolHeaders = document.querySelectorAll('.tool-header');
        for (let i = 0; i < Math.min(3, toolHeaders.length); i++) {
            if (toolHeaders[i]) {
                toolHeaders[i].classList.add('active');
                const nextElement = toolHeaders[i].nextElementSibling;
                if (nextElement) {
                    nextElement.classList.add('active');
                }
            }
        }

        // Create default presets if none exist
        this.createDefaultPresets();

        // Load and display saved presets (if preset container exists)
        this.displayPresets();

        // Initialize icon grids
        this.initializeIconGrids();
    }

    initializeIconGrids() {
        // Initialize selected icons storage
        if (!this.selectedIcons) {
            this.selectedIcons = {
                arrows: new Set(['double-arrow-up', 'double-arrow-down', 'double-arrow-left', 'double-arrow-right']),
                race: new Set()
            };
        }

        // Populate arrow icon grid
        const arrowGrid = document.getElementById('arrowIconGrid');
        if (arrowGrid && typeof IconLibrary !== 'undefined') {
            const arrowIcons = IconLibrary.getIconList('arrows');
            arrowGrid.innerHTML = '';

            arrowIcons.forEach(icon => {
                const button = document.createElement('button');
                button.className = 'icon-btn';
                button.dataset.category = 'arrows';
                button.dataset.iconId = icon.id;
                button.title = icon.name;

                // Create canvas for icon preview
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                IconLibrary.renderIcon(ctx, 'arrows', icon.id, 16, 16, 24, '#00d9ff');

                button.appendChild(canvas);

                // Set initial selection state
                if (this.selectedIcons.arrows.has(icon.id)) {
                    button.classList.add('selected');
                }

                // Click handler
                button.addEventListener('click', () => {
                    if (this.selectedIcons.arrows.has(icon.id)) {
                        this.selectedIcons.arrows.delete(icon.id);
                        button.classList.remove('selected');
                    } else {
                        this.selectedIcons.arrows.add(icon.id);
                        button.classList.add('selected');
                    }
                    this.updatePackSummary();
                });

                arrowGrid.appendChild(button);
            });
        }

        // Populate race icon grid
        const raceGrid = document.getElementById('raceIconGrid');
        if (raceGrid && typeof IconLibrary !== 'undefined') {
            const raceIcons = IconLibrary.getIconList('race');
            raceGrid.innerHTML = '';

            raceIcons.forEach(icon => {
                const button = document.createElement('button');
                button.className = 'icon-btn';
                button.dataset.category = 'race';
                button.dataset.iconId = icon.id;
                button.title = icon.name;

                // Create canvas for icon preview
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                IconLibrary.renderIcon(ctx, 'race', icon.id, 16, 16, 24, '#00d9ff');

                button.appendChild(canvas);

                // Set initial selection state
                if (this.selectedIcons.race.has(icon.id)) {
                    button.classList.add('selected');
                }

                // Click handler
                button.addEventListener('click', () => {
                    if (this.selectedIcons.race.has(icon.id)) {
                        this.selectedIcons.race.delete(icon.id);
                        button.classList.remove('selected');
                    } else {
                        this.selectedIcons.race.add(icon.id);
                        button.classList.add('selected');
                    }
                    this.updatePackSummary();
                });

                raceGrid.appendChild(button);
            });
        }

        // Setup icon config toggle
        const includeIconsCheckbox = document.getElementById('includeIcons');
        const iconConfig = document.getElementById('iconConfig');
        if (includeIconsCheckbox && iconConfig) {
            includeIconsCheckbox.addEventListener('change', () => {
                iconConfig.style.display = includeIconsCheckbox.checked ? 'block' : 'none';
                this.updatePackSummary();
            });
        }
    }

    createDefaultPresets() {
        // Only create default presets if no presets exist
        if (Object.keys(this.presets).length === 0) {
            const defaultPresets = {
                "Classic Racing": {
                    textPrefix: "Checkpoint",
                    fontSize: 65,
                    fontFamily: "Impact",
                    fontWeight: "700",
                    textColor: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    textSkew: 0,
                    backgroundType: "linear",
                    backgroundColor: "#2c3e50",
                    gradientColor1: "#e74c3c",
                    gradientColor2: "#c0392b",
                    gradientAngle: 45,
                    patternType: "stripes",
                    patternColor: "#34495e",
                    patternSize: 20,
                    imageOpacity: 50,
                    imageBlendMode: "normal",
                    textShadow: true,
                    shadowColor: "#000000",
                    shadowBlur: 8,
                    shadowOffsetX: 3,
                    shadowOffsetY: 3,
                    textStroke: false,
                    strokeColor: "#000000",
                    strokeWidth: 2,
                    textGlow: false,
                    glowColor: "#00ff00",
                    glowIntensity: 5,
                    hologram: false,
                    neon: false,
                    metallic: false,
                    chrome: false,
                    rainbow: false,
                    glitch: false,
                    effectIntensity: 5,
                    borderWidth: 4,
                    borderColor: "#ffffff",
                    borderStyle: "solid",
                    cornerRadius: 0,
                    signFormat: "6x1"
                },

                "Neon Cyber": {
                    textPrefix: "CP",
                    fontSize: 70,
                    fontFamily: "Orbitron",
                    fontWeight: "900",
                    textColor: "#00ffff",
                    textTransform: "uppercase",
                    letterSpacing: 3,
                    textSkew: 0,
                    backgroundType: "solid",
                    backgroundColor: "#000000",
                    gradientColor1: "#667eea",
                    gradientColor2: "#764ba2",
                    gradientAngle: 45,
                    patternType: "stripes",
                    patternColor: "#34495e",
                    patternSize: 20,
                    imageOpacity: 50,
                    imageBlendMode: "normal",
                    textShadow: false,
                    shadowColor: "#000000",
                    shadowBlur: 4,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2,
                    textStroke: false,
                    strokeColor: "#000000",
                    strokeWidth: 2,
                    textGlow: true,
                    glowColor: "#00ffff",
                    glowIntensity: 15,
                    hologram: false,
                    neon: true,
                    metallic: false,
                    chrome: false,
                    rainbow: false,
                    glitch: false,
                    effectIntensity: 8,
                    borderWidth: 2,
                    borderColor: "#00ffff",
                    borderStyle: "solid",
                    cornerRadius: 5,
                    signFormat: "6x1"
                },

                "Professional Clean": {
                    textPrefix: "Checkpoint",
                    fontSize: 55,
                    fontFamily: "Inter",
                    fontWeight: "600",
                    textColor: "#2c3e50",
                    textTransform: "none",
                    letterSpacing: 0,
                    textSkew: 0,
                    backgroundType: "solid",
                    backgroundColor: "#ffffff",
                    gradientColor1: "#667eea",
                    gradientColor2: "#764ba2",
                    gradientAngle: 45,
                    patternType: "stripes",
                    patternColor: "#34495e",
                    patternSize: 20,
                    imageOpacity: 50,
                    imageBlendMode: "normal",
                    textShadow: true,
                    shadowColor: "#bdc3c7",
                    shadowBlur: 2,
                    shadowOffsetX: 1,
                    shadowOffsetY: 1,
                    textStroke: false,
                    strokeColor: "#000000",
                    strokeWidth: 2,
                    textGlow: false,
                    glowColor: "#00ff00",
                    glowIntensity: 5,
                    hologram: false,
                    neon: false,
                    metallic: false,
                    chrome: false,
                    rainbow: false,
                    glitch: false,
                    effectIntensity: 5,
                    borderWidth: 2,
                    borderColor: "#95a5a6",
                    borderStyle: "solid",
                    cornerRadius: 8,
                    signFormat: "6x1"
                },

                "Retro Gaming": {
                    textPrefix: "STAGE",
                    fontSize: 50,
                    fontFamily: "Press Start 2P",
                    fontWeight: "400",
                    textColor: "#ffff00",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    textSkew: 0,
                    backgroundType: "linear",
                    backgroundColor: "#2c3e50",
                    gradientColor1: "#8e44ad",
                    gradientColor2: "#3498db",
                    gradientAngle: 90,
                    patternType: "stripes",
                    patternColor: "#34495e",
                    patternSize: 20,
                    imageOpacity: 50,
                    imageBlendMode: "normal",
                    textShadow: true,
                    shadowColor: "#000000",
                    shadowBlur: 0,
                    shadowOffsetX: 3,
                    shadowOffsetY: 3,
                    textStroke: true,
                    strokeColor: "#2c3e50",
                    strokeWidth: 3,
                    textGlow: false,
                    glowColor: "#00ff00",
                    glowIntensity: 5,
                    hologram: false,
                    neon: false,
                    metallic: false,
                    chrome: false,
                    rainbow: false,
                    glitch: false,
                    effectIntensity: 5,
                    borderWidth: 4,
                    borderColor: "#ffff00",
                    borderStyle: "solid",
                    cornerRadius: 0,
                    signFormat: "6x1"
                },

                "Military Tactical": {
                    textPrefix: "CHECKPOINT",
                    fontSize: 60,
                    fontFamily: "Oswald",
                    fontWeight: "700",
                    textColor: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    textSkew: 0,
                    backgroundType: "pattern",
                    backgroundColor: "#2d5016",
                    gradientColor1: "#667eea",
                    gradientColor2: "#764ba2",
                    gradientAngle: 45,
                    patternType: "stripes",
                    patternColor: "#1a2e0a",
                    patternSize: 15,
                    imageOpacity: 50,
                    imageBlendMode: "normal",
                    textShadow: true,
                    shadowColor: "#000000",
                    shadowBlur: 6,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2,
                    textStroke: true,
                    strokeColor: "#1a2e0a",
                    strokeWidth: 2,
                    textGlow: false,
                    glowColor: "#00ff00",
                    glowIntensity: 5,
                    hologram: false,
                    neon: false,
                    metallic: false,
                    chrome: false,
                    rainbow: false,
                    glitch: false,
                    effectIntensity: 5,
                    borderWidth: 3,
                    borderColor: "#5a8a30",
                    borderStyle: "solid",
                    cornerRadius: 0,
                    signFormat: "6x1"
                },

                "Elegant Gold": {
                    textPrefix: "Checkpoint",
                    fontSize: 65,
                    fontFamily: "Georgia",
                    fontWeight: "700",
                    textColor: "#2c3e50",
                    textTransform: "capitalize",
                    letterSpacing: 1,
                    textSkew: 0,
                    backgroundType: "radial",
                    backgroundColor: "#f39c12",
                    gradientColor1: "#f1c40f",
                    gradientColor2: "#d68910",
                    gradientAngle: 45,
                    patternType: "stripes",
                    patternColor: "#34495e",
                    patternSize: 20,
                    imageOpacity: 50,
                    imageBlendMode: "normal",
                    textShadow: true,
                    shadowColor: "#d68910",
                    shadowBlur: 3,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2,
                    textStroke: false,
                    strokeColor: "#000000",
                    strokeWidth: 2,
                    textGlow: false,
                    glowColor: "#00ff00",
                    glowIntensity: 5,
                    hologram: false,
                    neon: false,
                    metallic: true,
                    chrome: false,
                    rainbow: false,
                    glitch: false,
                    effectIntensity: 5,
                    borderWidth: 3,
                    borderColor: "#8b7355",
                    borderStyle: "groove",
                    cornerRadius: 10,
                    signFormat: "6x1"
                },

                "Space Chrome": {
                    textPrefix: "SECTOR",
                    fontSize: 68,
                    fontFamily: "Exo 2",
                    fontWeight: "800",
                    textColor: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: 3,
                    textSkew: -2,
                    backgroundType: "noise",
                    backgroundColor: "#1a1a2e",
                    gradientColor1: "#667eea",
                    gradientColor2: "#764ba2",
                    gradientAngle: 45,
                    patternType: "stripes",
                    patternColor: "#16213e",
                    patternSize: 12,
                    imageOpacity: 50,
                    imageBlendMode: "normal",
                    textShadow: true,
                    shadowColor: "#000000",
                    shadowBlur: 5,
                    shadowOffsetX: 3,
                    shadowOffsetY: 3,
                    textStroke: false,
                    strokeColor: "#000000",
                    strokeWidth: 2,
                    textGlow: false,
                    glowColor: "#00ff00",
                    glowIntensity: 5,
                    hologram: false,
                    neon: false,
                    metallic: false,
                    chrome: true,
                    rainbow: false,
                    glitch: false,
                    effectIntensity: 7,
                    borderWidth: 2,
                    borderColor: "#0f3460",
                    borderStyle: "solid",
                    cornerRadius: 5,
                    signFormat: "6x1"
                },

                "Rainbow Party": {
                    textPrefix: "FUN",
                    fontSize: 75,
                    fontFamily: "Bungee",
                    fontWeight: "400",
                    textColor: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: 4,
                    textSkew: 0,
                    backgroundType: "linear",
                    backgroundColor: "#2c3e50",
                    gradientColor1: "#ff006e",
                    gradientColor2: "#8338ec",
                    gradientAngle: 135,
                    patternType: "stripes",
                    patternColor: "#34495e",
                    patternSize: 20,
                    imageOpacity: 50,
                    imageBlendMode: "normal",
                    textShadow: true,
                    shadowColor: "#000000",
                    shadowBlur: 10,
                    shadowOffsetX: 3,
                    shadowOffsetY: 3,
                    textStroke: false,
                    strokeColor: "#000000",
                    strokeWidth: 2,
                    textGlow: false,
                    glowColor: "#00ff00",
                    glowIntensity: 5,
                    hologram: false,
                    neon: false,
                    metallic: false,
                    chrome: false,
                    rainbow: true,
                    glitch: false,
                    effectIntensity: 6,
                    borderWidth: 4,
                    borderColor: "#ffffff",
                    borderStyle: "solid",
                    cornerRadius: 15,
                    signFormat: "6x1"
                },

                "Glitch Horror": {
                    textPrefix: "ERROR",
                    fontSize: 62,
                    fontFamily: "Creepster",
                    fontWeight: "400",
                    textColor: "#ff0000",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    textSkew: 0,
                    backgroundType: "solid",
                    backgroundColor: "#000000",
                    gradientColor1: "#667eea",
                    gradientColor2: "#764ba2",
                    gradientAngle: 45,
                    patternType: "stripes",
                    patternColor: "#34495e",
                    patternSize: 20,
                    imageOpacity: 50,
                    imageBlendMode: "normal",
                    textShadow: false,
                    shadowColor: "#000000",
                    shadowBlur: 4,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2,
                    textStroke: false,
                    strokeColor: "#000000",
                    strokeWidth: 2,
                    textGlow: false,
                    glowColor: "#00ff00",
                    glowIntensity: 5,
                    hologram: false,
                    neon: false,
                    metallic: false,
                    chrome: false,
                    rainbow: false,
                    glitch: true,
                    effectIntensity: 8,
                    borderWidth: 2,
                    borderColor: "#ff0000",
                    borderStyle: "dashed",
                    cornerRadius: 0,
                    signFormat: "6x1"
                },

                "Minimalist Modern": {
                    textPrefix: "Point",
                    fontSize: 58,
                    fontFamily: "Rajdhani",
                    fontWeight: "500",
                    textColor: "#34495e",
                    textTransform: "none",
                    letterSpacing: 1,
                    textSkew: 0,
                    backgroundType: "solid",
                    backgroundColor: "#ecf0f1",
                    gradientColor1: "#667eea",
                    gradientColor2: "#764ba2",
                    gradientAngle: 45,
                    patternType: "stripes",
                    patternColor: "#34495e",
                    patternSize: 20,
                    imageOpacity: 50,
                    imageBlendMode: "normal",
                    textShadow: false,
                    shadowColor: "#000000",
                    shadowBlur: 4,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2,
                    textStroke: false,
                    strokeColor: "#000000",
                    strokeWidth: 2,
                    textGlow: false,
                    glowColor: "#00ff00",
                    glowIntensity: 5,
                    hologram: false,
                    neon: false,
                    metallic: false,
                    chrome: false,
                    rainbow: false,
                    glitch: false,
                    effectIntensity: 5,
                    borderWidth: 1,
                    borderColor: "#bdc3c7",
                    borderStyle: "solid",
                    cornerRadius: 12,
                    signFormat: "6x1"
                }
            };

            this.presets = defaultPresets;
            this.savePresetsToStorage();
        }
    }

    getSignDimensions() {
        const format = this.elements.signFormat.value;
        switch (format) {
            case '6x1': return { width: 512, height: 80 };
            case '1x1': return { width: 1024, height: 1024 };
            case '2x1': return { width: 1024, height: 512 };
            case '4x1': return { width: 1024, height: 256 };
            default: return { width: 512, height: 80 };
        }
    }

    formatNumber(number) {
        if (!this.elements.numberFormat) return number.toString();

        const format = this.elements.numberFormat.value;
        switch (format) {
            case '001':
                return number.toString().padStart(3, '0');
            case '1':
                return number.toString();
            case 'CP001':
                return 'CP' + number.toString().padStart(3, '0');
            case 'CP1':
                return 'CP' + number.toString();
            default:
                return number.toString().padStart(3, '0');
        }
    }

    getFileName(number) {
        const prefix = this.elements.customPrefix?.value || '';
        const suffix = this.elements.numberSuffix?.value || 'padded';

        let numberStr;
        if (suffix === 'simple') {
            numberStr = number.toString();
        } else {
            numberStr = number.toString().padStart(3, '0');
        }

        // Clean prefix to be filename-safe (allow empty)
        const cleanPrefix = prefix.trim().replace(/[^a-zA-Z0-9-_]/g, '');

        // If no prefix, just use the number
        if (!cleanPrefix) {
            return `${numberStr}.png`;
        }

        return `${cleanPrefix}${numberStr}.png`;
    }

    updatePreview() {
        const dimensions = this.getSignDimensions();
        const aspectRatio = dimensions.width / dimensions.height;

        // Set consistent preview canvas size for current format
        const maxWidth = 280;
        const canvasHeight = Math.round(maxWidth / aspectRatio);

        // Update main preview canvases (current format)
        ['cp1', 'start', 'arrow', 'finish'].forEach(key => {
            if (this.canvases[key]) {
                this.canvases[key].width = maxWidth;
                this.canvases[key].height = canvasHeight;
            }
        });

        // Set dimensions for format-specific previews
        if (this.canvases.cp1x1) {
            const size1x1 = 150;
            this.canvases.cp1x1.width = size1x1;
            this.canvases.cp1x1.height = size1x1;
        }

        if (this.canvases.cp4x1) {
            const width4x1 = 280;
            const height4x1 = Math.round(width4x1 / 4);
            this.canvases.cp4x1.width = width4x1;
            this.canvases.cp4x1.height = height4x1;
        }

        // Draw different sign types
        const checkpointPrefix = this.elements.checkpointPrefix?.value || 'Checkpoint';
        const startText = this.elements.startText?.value || 'START';
        const finishText = this.elements.finishText?.value || 'FINISH';

        // Checkpoint example (current format)
        this.drawSign(this.contexts.cp1, maxWidth, canvasHeight, `${checkpointPrefix} 1`);

        // START sign
        this.drawSign(this.contexts.start, maxWidth, canvasHeight, startText);

        // FINISH sign
        this.drawSign(this.contexts.finish, maxWidth, canvasHeight, finishText);

        // Icon example - show first selected icon or double-arrow-right as default
        const includeIcons = document.getElementById('includeIcons')?.checked;
        if (includeIcons && this.selectedIcons && (this.selectedIcons.arrows.size > 0 || this.selectedIcons.race.size > 0)) {
            // Show first selected arrow icon or first selected race icon
            let iconCategory = 'arrows';
            let iconId = 'double-arrow-right';

            if (this.selectedIcons.arrows.size > 0) {
                iconId = Array.from(this.selectedIcons.arrows)[0];
            } else if (this.selectedIcons.race.size > 0) {
                iconCategory = 'race';
                iconId = Array.from(this.selectedIcons.race)[0];
            }

            this.drawIconSign(this.contexts.arrow, maxWidth, canvasHeight, iconCategory, iconId);
        } else {
            // Fallback to arrow text for backward compatibility
            const arrowMode = this.elements.arrowMode?.value || 'rotated';
            if (arrowMode === 'rotated') {
                this.drawSign(this.contexts.arrow, maxWidth, canvasHeight, '↑', 90);
            } else {
                this.drawSign(this.contexts.arrow, maxWidth, canvasHeight, '→');
            }
        }
    }

    drawSign(ctx, width, height, number, rotation = null) {
        const settings = this.getSettings();

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Save context for transformations
        ctx.save();

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.textRenderingOptimization = 'optimizeQuality';

        // Draw background
        this.drawBackground(ctx, width, height, settings);

        // Draw border
        this.drawBorder(ctx, width, height, settings);

        // Apply rotation if specified (for rotated arrows)
        if (rotation !== null && rotation !== undefined) {
            ctx.save();
            // Move to center, rotate, then move back
            ctx.translate(width / 2, height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-width / 2, -height / 2);
        }

        // Draw text
        this.drawText(ctx, width, height, number, settings);

        // Restore rotation if applied
        if (rotation !== null && rotation !== undefined) {
            ctx.restore();
        }

        // Restore context
        ctx.restore();
    }

    drawIconSign(ctx, width, height, iconCategory, iconId) {
        const settings = this.getSettings();

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Save context for transformations
        ctx.save();

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw background
        this.drawBackground(ctx, width, height, settings);

        // Draw border
        this.drawBorder(ctx, width, height, settings);

        // Draw icon centered
        if (typeof IconLibrary !== 'undefined') {
            const iconSize = Math.min(width, height) * 0.6;
            const iconColor = settings.textColor || '#ffffff';

            // Apply text effects to icon color if needed
            let effectColor = iconColor;
            if (settings.textGlow || settings.neon) {
                const glowColor = settings.glowColor || '#00ffff';
                effectColor = glowColor;
            }

            IconLibrary.renderIcon(ctx, iconCategory, iconId, width / 2, height / 2, iconSize, effectColor);

            // Apply glow effect if enabled
            if (settings.textGlow || settings.neon) {
                ctx.save();
                ctx.shadowColor = settings.glowColor || '#00ffff';
                ctx.shadowBlur = (settings.glowIntensity || 5) * (width / 512);
                IconLibrary.renderIcon(ctx, iconCategory, iconId, width / 2, height / 2, iconSize, effectColor);
                ctx.restore();
            }
        }

        // Restore context
        ctx.restore();
    }

    drawBackground(ctx, width, height, settings) {
        const cornerRadius = settings.cornerRadius * (width / 512);

        // Create rounded rectangle path if needed
        if (cornerRadius > 0) {
            this.roundRect(ctx, 0, 0, width, height, cornerRadius);
            ctx.clip();
        }

        switch (settings.backgroundType) {
            case 'solid':
                ctx.fillStyle = settings.backgroundColor;
                ctx.fillRect(0, 0, width, height);
                break;

            case 'linear': {
                const angle = settings.gradientAngle * Math.PI / 180;
                const gradient = ctx.createLinearGradient(
                    0, 0,
                    Math.cos(angle) * width,
                    Math.sin(angle) * height
                );
                gradient.addColorStop(0, settings.gradientColor1);
                gradient.addColorStop(1, settings.gradientColor2);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                break;
            }

            case 'radial': {
                const radialGradient = ctx.createRadialGradient(
                    width / 2, height / 2, 0,
                    width / 2, height / 2, Math.max(width, height) / 2
                );
                radialGradient.addColorStop(0, settings.gradientColor1);
                radialGradient.addColorStop(1, settings.gradientColor2);
                ctx.fillStyle = radialGradient;
                ctx.fillRect(0, 0, width, height);
                break;
            }

            case 'conic': {
                const angle = (settings.gradientAngle || 0) * Math.PI / 180;
                const conicGradient = ctx.createConicGradient(
                    angle,
                    width / 2,
                    height / 2
                );
                conicGradient.addColorStop(0, settings.gradientColor1);
                conicGradient.addColorStop(0.5, settings.gradientColor2);
                conicGradient.addColorStop(1, settings.gradientColor1);
                ctx.fillStyle = conicGradient;
                ctx.fillRect(0, 0, width, height);
                break;
            }

            case 'pattern':
                this.drawPattern(ctx, width, height, settings);
                break;

            case 'noise':
                this.drawNoise(ctx, width, height, settings);
                break;

            case 'image':
                this.drawImageBackground(ctx, width, height, settings);
                break;

            case 'abstract':
                this.drawAbstractBackground(ctx, width, height, settings);
                break;
        }
    }

    drawImageBackground(ctx, width, height, settings) {
        if (this.backgroundImage) {
            ctx.save();
            ctx.globalAlpha = settings.imageOpacity / 100;
            ctx.globalCompositeOperation = settings.imageBlendMode;

            // Scale image to fit
            const scale = Math.max(width / this.backgroundImage.width, height / this.backgroundImage.height);
            const scaledWidth = this.backgroundImage.width * scale;
            const scaledHeight = this.backgroundImage.height * scale;
            const x = (width - scaledWidth) / 2;
            const y = (height - scaledHeight) / 2;

            ctx.drawImage(this.backgroundImage, x, y, scaledWidth, scaledHeight);
            ctx.restore();
        } else {
            // Fallback to solid color
            ctx.fillStyle = settings.backgroundColor;
            ctx.fillRect(0, 0, width, height);
        }
    }

    drawPattern(ctx, width, height, settings) {
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = settings.patternColor;
        const patternSize = settings.patternSize * (width / 512);

        switch (settings.patternType) {
            case 'stripes':
                for (let x = 0; x < width; x += patternSize * 2) {
                    ctx.fillRect(x, 0, patternSize, height);
                }
                break;

            case 'checkerboard':
                this.drawCheckerboardPattern(ctx, width, height, patternSize);
                break;

            case 'dots':
                this.drawDotsPattern(ctx, width, height, patternSize, settings.patternColor);
                break;

            case 'waves':
                this.drawWavePattern(ctx, width, height, patternSize, settings.patternColor);
                break;

            case 'grid':
                this.drawGridPattern(ctx, width, height, patternSize, settings.patternColor);
                break;

            case 'hexagon':
                this.drawHexagonPattern(ctx, width, height, patternSize, settings.patternColor);
                break;

            case 'carbon':
                this.drawCarbonPattern(ctx, width, height, patternSize, settings.patternColor);
                break;

            case 'spiral':
                this.drawSpiralPattern(ctx, width, height, patternSize, settings.patternColor);
                break;

            case 'zigzag':
                this.drawZigzagPattern(ctx, width, height, patternSize, settings.patternColor);
                break;

            case 'crosshatch':
                this.drawCrosshatchPattern(ctx, width, height, patternSize, settings.patternColor);
                break;

            case 'triangular':
                this.drawTriangularPattern(ctx, width, height, patternSize, settings.patternColor);
                break;

            case 'diamonds':
                this.drawDiamondsPattern(ctx, width, height, patternSize, settings.patternColor);
                break;

            case 'circles':
                this.drawCirclesPattern(ctx, width, height, patternSize, settings.patternColor);
                break;

            case 'scales':
                this.drawScalesPattern(ctx, width, height, patternSize, settings.patternColor);
                break;
        }
    }

    drawCheckerboardPattern(ctx, width, height, patternSize) {
        for (let x = 0; x < width; x += patternSize) {
            for (let y = 0; y < height; y += patternSize) {
                if ((Math.floor(x / patternSize) + Math.floor(y / patternSize)) % 2 === 0) {
                    ctx.fillRect(x, y, patternSize, patternSize);
                }
            }
        }
    }

    drawDotsPattern(ctx, width, height, patternSize, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = patternSize / 8;
        for (let x = patternSize; x < width; x += patternSize * 1.5) {
            for (let y = patternSize; y < height; y += patternSize * 1.5) {
                ctx.beginPath();
                ctx.arc(x, y, patternSize / 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawWavePattern(ctx, width, height, size, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = size / 10;

        for (let y = 0; y < height; y += size) {
            ctx.beginPath();
            for (let x = 0; x <= width; x += 5) {
                const waveY = y + Math.sin(x / size) * (size / 4);
                if (x === 0) ctx.moveTo(x, waveY);
                else ctx.lineTo(x, waveY);
            }
            ctx.stroke();
        }
    }

    drawGridPattern(ctx, width, height, size, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= width; x += size) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= height; y += size) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    drawNoise(ctx, width, height, settings) {
        // First draw background color
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Parse background color
        const bgColor = this.hexToRgb(settings.backgroundColor);
        const patternColor = this.hexToRgb(settings.patternColor);
        const intensity = (settings.noiseIntensity || 20) / 100;

        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random();
            const mix = noise * intensity;

            if (noise > 0.5) {
                data[i] = Math.floor(bgColor.r * (1 - mix) + patternColor.r * mix);     // R
                data[i + 1] = Math.floor(bgColor.g * (1 - mix) + patternColor.g * mix); // G
                data[i + 2] = Math.floor(bgColor.b * (1 - mix) + patternColor.b * mix); // B
                data[i + 3] = Math.floor(255 * mix); // A
            } else {
                data[i + 3] = 0; // Transparent
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    drawBorder(ctx, width, height, settings) {
        if (settings.borderWidth > 0) {
            const borderWidth = settings.borderWidth * (width / 512);
            const cornerRadius = settings.cornerRadius * (width / 512);

            ctx.strokeStyle = settings.borderColor;
            ctx.lineWidth = borderWidth;

            // Set border style
            switch (settings.borderStyle) {
                case 'dashed':
                    ctx.setLineDash([borderWidth * 3, borderWidth * 2]);
                    break;
                case 'dotted':
                    ctx.setLineDash([borderWidth, borderWidth]);
                    break;
                case 'double':
                    this.drawDoubleBorder(ctx, width, height, borderWidth, cornerRadius);
                    return;
                case 'groove':
                    this.drawGrooveBorder(ctx, width, height, borderWidth, cornerRadius, settings.borderColor);
                    return;
                default:
                    ctx.setLineDash([]);
            }

            if (cornerRadius > 0) {
                this.roundRect(ctx, borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth, cornerRadius);
                ctx.stroke();
            } else {
                ctx.strokeRect(borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth);
            }
        }
    }

    drawDoubleBorder(ctx, width, height, borderWidth, cornerRadius) {
        // Outer border
        if (cornerRadius > 0) {
            this.roundRect(ctx, borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth, cornerRadius);
        } else {
            ctx.strokeRect(borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth);
        }

        // Inner border
        const innerOffset = borderWidth * 2;
        if (cornerRadius > 0) {
            this.roundRect(ctx, innerOffset, innerOffset, width - innerOffset * 2, height - innerOffset * 2, Math.max(0, cornerRadius - innerOffset));
        } else {
            ctx.strokeRect(innerOffset, innerOffset, width - innerOffset * 2, height - innerOffset * 2);
        }
    }

    drawGrooveBorder(ctx, width, height, borderWidth, cornerRadius, color) {
        // Create groove effect with light and dark colors
        const lightColor = this.lightenColor(color, 40);
        const darkColor = this.darkenColor(color, 40);

        ctx.lineWidth = borderWidth / 2;

        // Light part
        ctx.strokeStyle = lightColor;
        if (cornerRadius > 0) {
            this.roundRect(ctx, borderWidth/4, borderWidth/4, width - borderWidth/2, height - borderWidth/2, cornerRadius);
            ctx.stroke();
        } else {
            ctx.strokeRect(borderWidth/4, borderWidth/4, width - borderWidth/2, height - borderWidth/2);
        }

        // Dark part
        ctx.strokeStyle = darkColor;
        if (cornerRadius > 0) {
            this.roundRect(ctx, borderWidth * 3/4, borderWidth * 3/4, width - borderWidth * 1.5, height - borderWidth * 1.5, Math.max(0, cornerRadius - borderWidth/2));
            ctx.stroke();
        } else {
            ctx.strokeRect(borderWidth * 3/4, borderWidth * 3/4, width - borderWidth * 1.5, height - borderWidth * 1.5);
        }
    }

    drawText(ctx, width, height, number, settings) {
        let text = settings.textPrefix && settings.textPrefix.trim() ? `${settings.textPrefix} ${number}` : number.toString();

        // Apply text transform
        switch (settings.textTransform) {
            case 'uppercase':
                text = text.toUpperCase();
                break;
            case 'lowercase':
                text = text.toLowerCase();
                break;
            case 'capitalize':
                text = text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                break;
        }

        // Set font with fallbacks
        const scaledFontSize = settings.fontSize * (width / 512);
        const fontFallbacks = this.getFontFallbacks(settings.fontFamily);
        ctx.font = `${settings.fontWeight} ${scaledFontSize}px ${fontFallbacks}`;

        // Set canvas text alignment based on positioning settings
        ctx.textAlign = settings.textHorizontalAlign || 'center';

        // Always use middle baseline for consistent behavior
        ctx.textBaseline = 'middle';

        // Apply text skew
        if (settings.textSkew !== 0) {
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.transform(1, 0, Math.tan(settings.textSkew * Math.PI / 180), 1, 0, 0);
            ctx.translate(-width / 2, -height / 2);
        }

        // Calculate text position based on alignment settings
        const { x, y } = this.calculateTextPosition(width, height, settings);

        // Apply letter spacing (approximate)
        if (settings.letterSpacing !== 0) {
            this.drawTextWithSpacing(ctx, text, x, y, settings.letterSpacing * (width / 512), settings);
        } else {
            this.applyTextEffects(ctx, text, x, y, settings);
        }

        if (settings.textSkew !== 0) {
            ctx.restore();
        }
    }

    calculateTextPosition(width, height, settings) {
        let x, y;

        // Calculate horizontal position - use simple positions since we set textAlign
        switch (settings.textHorizontalAlign) {
            case 'left':
                x = width * 0.05; // 5% from left edge
                break;
            case 'right':
                x = width * 0.95; // 5% from right edge
                break;
            case 'center':
            default:
                x = width / 2;
                break;
        }

        // Calculate vertical position with middle baseline
        switch (settings.textVerticalAlign) {
            case 'top': // "High" in UI - position near top
                y = height * 0.2; // 20% from top edge
                break;
            case 'bottom': // "Low" in UI - position near bottom
                y = height * 0.8; // 80% down (20% from bottom)
                break;
            case 'middle':
            default:
                y = height / 2; // Center
                break;
        }

        return { x, y };
    }

    drawTextWithSpacing(ctx, text, x, y, spacing, settings) {
        const chars = text.split('');
        const totalWidth = chars.reduce((acc, char) => acc + ctx.measureText(char).width + spacing, 0) - spacing;

        // Calculate starting position based on text alignment
        let currentX;
        switch (settings.textHorizontalAlign) {
            case 'left':
                currentX = x;
                break;
            case 'right':
                currentX = x - totalWidth;
                break;
            case 'center':
            default:
                currentX = x - totalWidth / 2;
                break;
        }

        // Temporarily override textAlign for individual characters
        const originalTextAlign = ctx.textAlign;
        ctx.textAlign = 'start'; // Use start for precise positioning

        chars.forEach(char => {
            const charWidth = ctx.measureText(char).width;
            this.applyTextEffects(ctx, char, currentX, y, settings);
            currentX += charWidth + spacing;
        });

        // Restore original textAlign
        ctx.textAlign = originalTextAlign;
    }

    applyTextEffects(ctx, text, x, y, settings) {
        // Check if we have special effects that provide their own rendering
        const hasSpecialEffect = settings.hologram || settings.neon || settings.metallic ||
                                settings.chrome || settings.rainbow || settings.glitch ||
                                settings.scanlines || settings.pixel || settings.retro || settings.depth3d;

        if (hasSpecialEffect) {
            // Apply special effects with potential stacking
            this.drawSpecialEffects(ctx, text, x, y, settings);
        } else {
            // Apply regular effects with stacking
            this.drawRegularEffects(ctx, text, x, y, settings);
        }
    }

    drawSpecialEffects(ctx, text, x, y, settings) {
        // Special effects can still have shadows and outlines

        // Draw shadow first (behind everything)
        if (settings.textShadow) {
            ctx.save();
            ctx.shadowColor = settings.shadowColor;
            ctx.shadowBlur = settings.shadowBlur;
            ctx.shadowOffsetX = settings.shadowOffsetX;
            ctx.shadowOffsetY = settings.shadowOffsetY;
            ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Very transparent for shadow base
            ctx.fillText(text, x, y);
            ctx.restore();
        }

        // Apply special effect
        if (settings.hologram) {
            this.drawHologramText(ctx, text, x, y, settings);
        } else if (settings.neon) {
            this.drawNeonText(ctx, text, x, y, settings);
        } else if (settings.metallic) {
            this.drawMetallicText(ctx, text, x, y, settings);
        } else if (settings.chrome) {
            this.drawChromeText(ctx, text, x, y, settings);
        } else if (settings.rainbow) {
            this.drawRainbowText(ctx, text, x, y, settings);
        } else if (settings.glitch) {
            this.drawGlitchText(ctx, text, x, y, settings);
        } else if (settings.scanlines) {
            this.drawScanlinesText(ctx, text, x, y, settings);
        } else if (settings.pixel) {
            this.drawPixelText(ctx, text, x, y, settings);
        } else if (settings.retro) {
            this.drawRetroText(ctx, text, x, y, settings);
        } else if (settings.depth3d) {
            this.draw3DDepthText(ctx, text, x, y, settings);
        }

        // Add outline on top if enabled
        if (settings.textStroke) {
            ctx.save();
            ctx.strokeStyle = settings.strokeColor;
            ctx.lineWidth = settings.strokeWidth;
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeText(text, x, y);
            ctx.restore();
        }

        // Add glow effect on top if enabled
        if (settings.textGlow) {
            ctx.save();
            ctx.shadowColor = settings.glowColor;
            ctx.shadowBlur = settings.glowIntensity;
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillText(text, x, y);
            ctx.restore();
        }
    }

    drawRegularEffects(ctx, text, x, y, settings) {
        // Layer effects properly for stacking
        let hasDrawnText = false;

        // 1. Draw shadow first (furthest back)
        if (settings.textShadow) {
            ctx.save();
            ctx.shadowColor = settings.shadowColor;
            ctx.shadowBlur = settings.shadowBlur;
            ctx.shadowOffsetX = settings.shadowOffsetX;
            ctx.shadowOffsetY = settings.shadowOffsetY;
            ctx.fillStyle = settings.textColor;
            ctx.fillText(text, x, y);
            ctx.restore();
            hasDrawnText = true;
        }

        // 2. Draw glow (behind main text)
        if (settings.textGlow) {
            ctx.save();
            ctx.shadowColor = settings.glowColor;
            ctx.shadowBlur = settings.glowIntensity;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillStyle = settings.textColor;
            ctx.fillText(text, x, y);
            ctx.restore();
            hasDrawnText = true;
        }

        // 3. Draw main text
        if (!hasDrawnText) {
            ctx.fillStyle = settings.textColor;
            ctx.fillText(text, x, y);
        }

        // 4. Draw stroke/outline on top
        if (settings.textStroke) {
            ctx.save();
            ctx.strokeStyle = settings.strokeColor;
            ctx.lineWidth = settings.strokeWidth;
            ctx.strokeText(text, x, y);
            ctx.restore();
        }
    }

    drawHologramText(ctx, text, x, y, settings) {
        const intensity = settings.effectIntensity || 5;
        const colors = ['#ff0080', '#00ff80', '#8000ff'];
        const offsets = [intensity, -intensity, 0];

        colors.forEach((color, index) => {
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.7;
            ctx.fillText(text, x + offsets[index], y + offsets[index]);
        });

        ctx.globalAlpha = 1;
    }

    drawNeonText(ctx, text, x, y, settings) {
        const intensity = settings.effectIntensity || 5;

        // Draw multiple glow layers for neon effect
        ctx.save();

        // Outer glow (largest)
        ctx.shadowColor = settings.textColor;
        ctx.shadowBlur = intensity * 6;
        ctx.fillStyle = settings.textColor;
        ctx.globalAlpha = 0.3;
        ctx.fillText(text, x, y);

        // Middle glow
        ctx.shadowBlur = intensity * 3;
        ctx.globalAlpha = 0.6;
        ctx.fillText(text, x, y);

        // Inner glow (core)
        ctx.shadowBlur = intensity;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.fillText(text, x, y);

        ctx.restore();
    }

    drawMetallicText(ctx, text, x, y, settings) {
        const gradient = ctx.createLinearGradient(0, y - 20, 0, y + 20);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#c0c0c0');
        gradient.addColorStop(0.7, '#808080');
        gradient.addColorStop(1, '#404040');

        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeText(text, x, y);
    }

    drawChromeText(ctx, text, x, y, settings) {
        const gradient = ctx.createLinearGradient(0, y - 30, 0, y + 30);
        gradient.addColorStop(0, '#f0f0f0');
        gradient.addColorStop(0.2, '#ffffff');
        gradient.addColorStop(0.4, '#d0d0d0');
        gradient.addColorStop(0.6, '#a0a0a0');
        gradient.addColorStop(0.8, '#ffffff');
        gradient.addColorStop(1, '#e0e0e0');

        ctx.save();
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y);
        ctx.restore();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeText(text, x, y);
    }

    drawRainbowText(ctx, text, x, y, settings) {
        const chars = text.split('');
        const charWidth = ctx.measureText('M').width; // Approximate
        const totalWidth = chars.length * charWidth;
        let currentX = x - totalWidth / 2;

        chars.forEach((char, index) => {
            const hue = (index * 360 / chars.length) % 360;
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            ctx.fillText(char, currentX, y);
            currentX += charWidth;
        });
    }

    drawGlitchText(ctx, text, x, y, settings) {
        const intensity = settings.effectIntensity || 5;

        ctx.save();

        // Main text
        ctx.fillStyle = settings.textColor;
        ctx.fillText(text, x, y);

        // Glitch layers with varying intensities
        const glitchColors = ['#ff0000', '#00ff00', '#0000ff'];
        const offsets = [
            { x: intensity, y: 0 },
            { x: -intensity, y: 0 },
            { x: 0, y: intensity },
            { x: intensity * 0.5, y: -intensity * 0.5 }
        ];

        glitchColors.forEach((color, index) => {
            if (offsets[index]) {
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.4;
                ctx.globalCompositeOperation = 'screen';
                ctx.fillText(text, x + offsets[index].x, y + offsets[index].y);
            }
        });

        ctx.restore();
    }

    drawScanlinesText(ctx, text, x, y, settings) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // Draw the main text first
        ctx.fillStyle = settings.textColor;
        ctx.fillText(text, x, y);

        // Create scanlines overlay
        ctx.save();
        const lineSpacing = 4;
        const intensity = (settings.effectIntensity || 50) / 100;

        ctx.strokeStyle = `rgba(0, 0, 0, ${intensity * 0.3})`;
        ctx.lineWidth = 2;

        for (let scanY = 0; scanY < height; scanY += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, scanY);
            ctx.lineTo(width, scanY);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawPixelText(ctx, text, x, y, settings) {
        const intensity = Math.max(2, Math.floor((settings.effectIntensity || 50) / 10));

        // Draw text to temp canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = ctx.canvas.width;
        tempCanvas.height = ctx.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Copy font settings
        tempCtx.font = ctx.font;
        tempCtx.textAlign = ctx.textAlign;
        tempCtx.textBaseline = ctx.textBaseline;
        tempCtx.fillStyle = settings.textColor;
        tempCtx.fillText(text, x, y);

        // Pixelate effect by scaling down and up
        const scaledWidth = Math.floor(tempCanvas.width / intensity);
        const scaledHeight = Math.floor(tempCanvas.height / intensity);

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, 0, 0, scaledWidth, scaledHeight);
        ctx.drawImage(ctx.canvas, 0, 0, scaledWidth, scaledHeight, 0, 0, tempCanvas.width, tempCanvas.height);
        ctx.restore();

        // Draw pixelated version
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(ctx.canvas, 0, 0);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
    }

    drawRetroText(ctx, text, x, y, settings) {
        const intensity = (settings.effectIntensity || 50) / 100;

        // Draw main text with green tint for CRT effect
        ctx.save();
        ctx.fillStyle = settings.textColor;
        ctx.fillText(text, x, y);

        // Add phosphor glow
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10 * intensity;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#00ff00';
        ctx.fillText(text, x, y);

        // Add slight chromatic aberration
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ff0000';
        ctx.fillText(text, x - 2 * intensity, y);
        ctx.fillStyle = '#0000ff';
        ctx.fillText(text, x + 2 * intensity, y);

        ctx.restore();

        // Add scanlines
        this.drawScanlinesText(ctx, '', x, y, settings);
    }

    draw3DDepthText(ctx, text, x, y, settings) {
        const intensity = (settings.effectIntensity || 50) / 10;
        const layers = 8;

        ctx.save();

        // Draw depth layers from back to front
        for (let i = layers; i > 0; i--) {
            const offset = i * (intensity / layers);
            const alpha = 0.3 + (i / layers) * 0.7;

            // Create darker shades for depth
            const rgb = this.hexToRgb(settings.textColor);
            const darkenFactor = i / layers;
            const layerColor = `rgba(${Math.floor(rgb.r * darkenFactor)}, ${Math.floor(rgb.g * darkenFactor)}, ${Math.floor(rgb.b * darkenFactor)}, ${alpha})`;

            ctx.fillStyle = layerColor;
            ctx.fillText(text, x - offset, y + offset);
        }

        // Draw front layer
        ctx.fillStyle = settings.textColor;
        ctx.fillText(text, x, y);

        ctx.restore();
    }

    getFontFallbacks(fontFamily) {
        const fallbacks = {
            'Orbitron': '"Orbitron", "Arial Black", "Arial", sans-serif',
            'Rajdhani': '"Rajdhani", "Arial Narrow", "Arial", sans-serif',
            'Exo 2': '"Exo 2", "Helvetica", "Arial", sans-serif',
            'Press Start 2P': '"Press Start 2P", "Courier New", monospace',
            'Black Ops One': '"Black Ops One", "Impact", "Arial Black", sans-serif',
            'Russo One': '"Russo One", "Impact", "Arial Black", sans-serif',
            'Audiowide': '"Audiowide", "Arial Black", "Arial", sans-serif',
            'Bungee': '"Bungee", "Arial Black", "Arial", sans-serif',
            'Impact': 'Impact, "Arial Black", sans-serif',
            'Anton': '"Anton", "Arial Black", sans-serif',
            'Oswald': '"Oswald", "Arial Narrow", sans-serif',
            'Bebas Neue': '"Bebas Neue", "Arial Black", sans-serif',
            'JetBrains Mono': '"JetBrains Mono", "Consolas", "Courier New", monospace',
            'Fira Code': '"Fira Code", "Consolas", "Courier New", monospace'
        };

        return fallbacks[fontFamily] || `"${fontFamily}", Arial, sans-serif`;
    }

    // Helper functions
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
    }

    lightenColor(color, percent) {
        const rgb = this.hexToRgb(color);
        return `rgb(${Math.min(255, rgb.r + percent)}, ${Math.min(255, rgb.g + percent)}, ${Math.min(255, rgb.b + percent)})`;
    }

    darkenColor(color, percent) {
        const rgb = this.hexToRgb(color);
        return `rgb(${Math.max(0, rgb.r - percent)}, ${Math.max(0, rgb.g - percent)}, ${Math.max(0, rgb.b - percent)})`;
    }

    drawHexagonPattern(ctx, width, height, size, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        const hexRadius = size / 2;
        const hexHeight = hexRadius * Math.sqrt(3);

        for (let row = 0; row < height / hexHeight + 1; row++) {
            for (let col = 0; col < width / (hexRadius * 1.5) + 1; col++) {
                const x = col * hexRadius * 1.5;
                const y = row * hexHeight + (col % 2) * hexHeight / 2;

                if (x < width && y < height) {
                    this.drawHexagon(ctx, x, y, hexRadius);
                }
            }
        }
    }

    drawHexagon(ctx, x, y, radius) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
    }

    drawCarbonPattern(ctx, width, height, size, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        for (let x = 0; x < width + size; x += size) {
            for (let y = 0; y < height + size; y += size) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + size, y + size);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(x + size, y);
                ctx.lineTo(x, y + size);
                ctx.stroke();
            }
        }
    }

    drawSpiralPattern(ctx, width, height, size, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fillStyle = color;

        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
        const spacing = size / 2;

        for (let radius = 0; radius < maxRadius; radius += spacing) {
            ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
                const r = radius + (angle / (Math.PI * 4)) * spacing;
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                if (angle === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    drawZigzagPattern(ctx, width, height, size, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        const amplitude = size / 2;

        for (let y = 0; y < height; y += size) {
            ctx.beginPath();
            for (let x = 0; x <= width; x += size / 2) {
                const zigzagY = y + (x / (size / 2) % 2 === 0 ? -amplitude : amplitude);
                if (x === 0) ctx.moveTo(x, zigzagY);
                else ctx.lineTo(x, zigzagY);
            }
            ctx.stroke();
        }
    }

    drawCrosshatchPattern(ctx, width, height, size, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        // Diagonal lines going top-left to bottom-right
        for (let i = -height; i < width; i += size) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + height, height);
            ctx.stroke();
        }

        // Diagonal lines going top-right to bottom-left
        for (let i = 0; i < width + height; i += size) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i - height, height);
            ctx.stroke();
        }
    }

    drawTriangularPattern(ctx, width, height, size, color) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1;

        const triangleHeight = size * Math.sqrt(3) / 2;

        for (let y = 0; y < height + triangleHeight; y += triangleHeight) {
            for (let x = 0; x < width + size; x += size) {
                const offset = (Math.floor(y / triangleHeight) % 2) * (size / 2);

                // Draw upward triangle
                ctx.beginPath();
                ctx.moveTo(x + offset, y);
                ctx.lineTo(x + size / 2 + offset, y + triangleHeight);
                ctx.lineTo(x - size / 2 + offset, y + triangleHeight);
                ctx.closePath();
                ctx.stroke();
            }
        }
    }

    drawDiamondsPattern(ctx, width, height, size, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        for (let y = 0; y < height + size; y += size) {
            for (let x = 0; x < width + size; x += size) {
                ctx.beginPath();
                ctx.moveTo(x, y - size / 2);
                ctx.lineTo(x + size / 2, y);
                ctx.lineTo(x, y + size / 2);
                ctx.lineTo(x - size / 2, y);
                ctx.closePath();
                ctx.stroke();
            }
        }
    }

    drawCirclesPattern(ctx, width, height, size, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        for (let y = 0; y < height + size; y += size) {
            for (let x = 0; x < width + size; x += size) {
                ctx.beginPath();
                ctx.arc(x, y, size / 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    drawScalesPattern(ctx, width, height, size, color) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1;

        const radius = size / 2;
        const spacing = size * 0.8;

        for (let row = 0; row < height / spacing + 2; row++) {
            for (let col = 0; col < width / size + 2; col++) {
                const x = col * size + (row % 2) * (size / 2);
                const y = row * spacing;

                // Draw scale (arc)
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI);
                ctx.stroke();
            }
        }
    }


    updateStats() {
        const settings = this.getSettings();
        const dimensions = this.getSignDimensions();

        // Update sign info
        this.elements.statFormat.textContent = `${settings.signFormat.toUpperCase()} (${dimensions.width}×${dimensions.height})`;
        this.elements.statFont.textContent = settings.fontFamily;

        // Count active effects
        const effects = [];
        if (settings.textShadow) effects.push('Shadow');
        if (settings.textStroke) effects.push('Outline');
        if (settings.textGlow) effects.push('Glow');
        if (settings.hologram) effects.push('Hologram');
        if (settings.neon) effects.push('Neon');
        if (settings.metallic) effects.push('Metallic');
        if (settings.chrome) effects.push('Chrome');
        if (settings.rainbow) effects.push('Rainbow');
        if (settings.glitch) effects.push('Glitch');
        if (settings.scanlines) effects.push('Scanlines');
        if (settings.pixel) effects.push('Pixelated');
        if (settings.retro) effects.push('Retro CRT');
        if (settings.depth3d) effects.push('3D Depth');

        this.elements.statEffects.textContent = effects.length > 0 ? effects.join(', ') : 'None';
        this.elements.statBackground.textContent = settings.backgroundType.charAt(0).toUpperCase() + settings.backgroundType.slice(1);

        // Estimate file size and time
        const effectComplexity = effects.length;
        const baseSize = 0.5; // MB
        const sizeMultiplier = 1 + (effectComplexity * 0.3);
        const estimatedSize = (baseSize * sizeMultiplier * 100).toFixed(1); // 100 files

        this.elements.statFileSize.textContent = `~${estimatedSize}MB`;

        const baseTime = 20; // seconds
        const timeMultiplier = 1 + (effectComplexity * 0.2);
        const estimatedTime = Math.round(baseTime * timeMultiplier);

        this.elements.statTime.textContent = `~${estimatedTime}s`;
    }

    getSettings() {
        return {
            textPrefix: this.elements.textPrefix?.value || '',
            fontSize: parseInt(this.elements.fontSize.value),
            fontFamily: this.elements.fontFamily.value,
            fontWeight: this.elements.fontWeight.value,
            textColor: this.elements.textColor.value,
            textTransform: this.elements.textTransform.value,
            letterSpacing: parseInt(this.elements.letterSpacing.value),
            textSkew: parseInt(this.elements.textSkew.value),
            textHorizontalAlign: this.elements.textHorizontalAlign?.value || 'center',
            textVerticalAlign: this.elements.textVerticalAlign?.value || 'middle',

            backgroundType: this.elements.backgroundType.value,
            backgroundColor: this.elements.backgroundColor.value,
            gradientColor1: this.elements.gradientColor1.value,
            gradientColor2: this.elements.gradientColor2.value,
            gradientAngle: parseInt(this.elements.gradientAngle.value),
            patternType: this.elements.patternType.value,
            patternColor: this.elements.patternColor.value,
            patternSize: parseInt(this.elements.patternSize.value),
            noiseIntensity: parseInt(this.elements.noiseIntensity.value),
            noiseScale: parseInt(this.elements.noiseScale.value),
            imageOpacity: parseInt(this.elements.imageOpacity.value),
            imageBlendMode: this.elements.imageBlendMode.value,

            abstractStyle: document.getElementById('abstractStyle')?.value || 'racing',
            abstractDominant: document.getElementById('abstractDominant')?.value || '#1a1d29',
            abstractSecondary: document.getElementById('abstractSecondary')?.value || '#2a2f3f',
            abstractAccent: document.getElementById('abstractAccent')?.value || '#00d9ff',
            abstractComplexity: parseInt(document.getElementById('abstractComplexity')?.value || 5),
            abstractSeed: parseInt(document.getElementById('abstractSeed')?.value || 42),

            textShadow: this.elements.textShadow.checked,
            shadowColor: this.elements.shadowColor.value,
            shadowBlur: parseInt(this.elements.shadowBlur.value),
            shadowOffsetX: parseInt(this.elements.shadowOffsetX.value),
            shadowOffsetY: parseInt(this.elements.shadowOffsetY.value),
            textStroke: this.elements.textStroke.checked,
            strokeColor: this.elements.strokeColor.value,
            strokeWidth: parseInt(this.elements.strokeWidth.value),
            textGlow: this.elements.textGlow.checked,
            glowColor: this.elements.glowColor.value,
            glowIntensity: parseInt(this.elements.glowIntensity.value),

            hologram: this.elements.hologram.checked,
            neon: this.elements.neon.checked,
            metallic: this.elements.metallic.checked,
            chrome: this.elements.chrome.checked,
            rainbow: this.elements.rainbow.checked,
            glitch: this.elements.glitch.checked,
            scanlines: this.elements.scanlines?.checked || false,
            pixel: this.elements.pixel?.checked || false,
            retro: this.elements.retro?.checked || false,
            depth3d: this.elements.depth3d?.checked || false,
            effectIntensity: parseInt(this.elements.effectIntensity.value),

            borderWidth: parseInt(this.elements.borderWidth.value),
            borderColor: this.elements.borderColor.value,
            borderStyle: this.elements.borderStyle.value,
            cornerRadius: parseInt(this.elements.cornerRadius.value),

            signFormat: this.elements.signFormat.value,
            arrowMode: this.elements.arrowMode?.value || 'rotated',
            arrowDirections: this.elements.arrowDirections?.value || '4'
        };
    }

    // Preset Management
    savePreset() {
        // Use prompt instead of missing form element
        const name = prompt('Enter preset name:');
        if (!name || !name.trim()) {
            return;
        }

        const settings = this.getSettings();
        this.presets[name.trim()] = settings;
        this.savePresetsToStorage();
        this.displayPresets();
        alert(`Preset "${name.trim()}" saved successfully!`);
    }

    loadPreset(name) {
        if (this.presets[name]) {
            this.applySettings(this.presets[name]);
        }
    }

    deletePreset(name) {
        if (confirm(`Delete preset "${name}"?`)) {
            delete this.presets[name];
            this.savePresetsToStorage();
            this.displayPresets();
        }
    }

    displayPresets() {
        const container = this.elements.presetList;
        if (!container) {
            console.log('Preset list container not found - preset display skipped');
            return;
        }

        container.innerHTML = '';

        Object.keys(this.presets).forEach(name => {
            const presetDiv = document.createElement('div');
            presetDiv.className = 'preset-item';
            presetDiv.innerHTML = `
                <span>${name}</span>
                <div class="preset-actions">
                    <button class="preset-btn" onclick="generator.loadPreset('${name}')">Load</button>
                    <button class="preset-btn" onclick="generator.deletePreset('${name}')">Delete</button>
                </div>
            `;
            container.appendChild(presetDiv);
        });
    }

    savePresetsToStorage() {
        localStorage.setItem('tmSignpackPresets', JSON.stringify(this.presets));
    }

    loadPresets() {
        const saved = localStorage.getItem('tmSignpackPresets');
        return saved ? JSON.parse(saved) : {};
    }

    applySettings(settings) {
        Object.entries(settings).forEach(([key, value]) => {
            const element = this.elements[key];
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }

                // Update value displays for range inputs
                const valueDisplay = this.elements[key + 'Value'];
                if (valueDisplay && element.type === 'range') {
                    const unit = valueDisplay.textContent.replace(/[\d.-]/g, '');
                    valueDisplay.textContent = value + unit;
                }
            }
        });

        this.toggleBackgroundControls();
        this.setupEffectToggles();
        this.updatePreview();
    }

    // Advanced Tools
    applyBatchOperation() {
        if (!this.elements.batchOperation || !this.elements.startNumber || !this.elements.endNumber) {
            console.log('Batch operation elements not found - feature not available');
            alert('Batch operations are not available in this interface');
            return;
        }

        const operation = this.elements.batchOperation.value;
        const start = parseInt(this.elements.startNumber.value);
        const end = parseInt(this.elements.endNumber.value);

        switch (operation) {
            case 'gradient-numbers':
                this.applyGradientNumbers(start, end);
                break;
            case 'random-colors':
                this.applyRandomColors();
                break;
            case 'size-progression':
                this.applySizeProgression(start, end);
                break;
            case 'style-alternation':
                this.applyStyleAlternation();
                break;
        }
    }

    applyGradientNumbers(start, end) {
        // This would require more complex state management for individual signs
        alert('Gradient Numbers: This feature would apply a color gradient across the number range during generation.');
    }

    applyRandomColors() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.elements.textColor.value = randomColor;
        this.updatePreview();
    }

    applySizeProgression(start, end) {
        alert('Size Progression: This feature would apply varying font sizes across the number range during generation.');
    }

    applyStyleAlternation() {
        // Toggle between two styles
        const currentFont = this.elements.fontFamily.value;
        const alternateFont = currentFont === 'Arial' ? 'Impact' : 'Arial';
        this.elements.fontFamily.value = alternateFont;
        this.updatePreview();
    }

    randomizeAll() {
        // Font selection with weights (common fonts get higher weight)
        if (!this.lockedSettings.has('fontFamily')) {
            const fonts = [
                'Arial', 'Impact', 'Roboto', 'Inter', 'Oswald', 'Anton', 'Bebas Neue', 'Rajdhani',  // Common
                'Orbitron', 'Exo 2', 'Audiowide', 'Russo One', 'Racing Sans One', 'Righteous',     // Gaming/Tech
                'Bungee', 'Black Ops One', 'Press Start 2P', 'Permanent Marker', 'Bangers'         // Decorative (rare)
            ];
            const fontWeights = [
                10, 10, 8, 8, 8, 8, 8, 8,  // Common fonts
                6, 6, 6, 6, 6, 6,           // Gaming fonts
                2, 1, 1, 1, 1               // Decorative (rare)
            ];
            this.elements.fontFamily.value = this.weightedRandom(fonts, fontWeights);
        }

        // Background types with weights (solid and gradients more common)
        if (!this.lockedSettings.has('backgroundType')) {
            const bgTypes = ['solid', 'linear', 'radial', 'pattern', 'noise', 'image'];
            const bgWeights = [8, 6, 4, 3, 2, 1]; // Solid most common, image least common
            this.elements.backgroundType.value = this.weightedRandom(bgTypes, bgWeights);
        }

        // Text color randomization (skip if locked)
        if (!this.lockedSettings.has('textColor')) {
            this.elements.textColor.value = this.randomColor();
        }

        // Other text settings (not locked individually)
        this.elements.fontSize.value = Math.floor(Math.random() * 60) + 30; // 30-90px

        // Font weight with preference for normal/bold
        const fontWeights = ['300', '400', '600', '700', '900'];
        const fontWeightWeights = [1, 5, 4, 3, 1]; // Prefer normal/semi-bold
        this.elements.fontWeight.value = this.weightedRandom(fontWeights, fontWeightWeights);

        // Text transform with preference for none/uppercase
        const textTransforms = ['none', 'uppercase', 'lowercase', 'capitalize'];
        const transformWeights = [6, 4, 1, 2]; // Prefer none and uppercase
        this.elements.textTransform.value = this.weightedRandom(textTransforms, transformWeights);

        this.elements.letterSpacing.value = Math.floor(Math.random() * 10) - 2; // -2 to 8
        this.elements.textSkew.value = Math.floor(Math.random() * 21) - 10; // -10 to 10

        // Background-specific settings
        const bgType = this.elements.backgroundType.value;
        if (bgType === 'pattern' || bgType === 'noise') {
            const patterns = ['stripes', 'checkerboard', 'dots', 'waves', 'grid', 'hexagon', 'carbon'];
            const patternWeights = [3, 3, 2, 2, 2, 1, 1]; // Prefer simple patterns
            this.elements.patternType.value = this.weightedRandom(patterns, patternWeights);
            this.elements.patternSize.value = Math.floor(Math.random() * 40) + 10; // 10-50px
            this.elements.noiseIntensity.value = Math.floor(Math.random() * 80) + 10; // 10-90%
            this.elements.noiseScale.value = Math.floor(Math.random() * 8) + 1; // 1-9x
        }

        if (bgType === 'linear' || bgType === 'radial') {
            this.elements.gradientAngle.value = Math.floor(Math.random() * 360);
        }

        // Colors (only randomize if not locked)
        this.elements.backgroundColor.value = this.randomColor();
        this.elements.gradientColor1.value = this.randomColor();
        this.elements.gradientColor2.value = this.randomColor();
        this.elements.patternColor.value = this.randomColor();
        this.elements.borderColor.value = this.randomColor();
        this.elements.shadowColor.value = this.randomColor();
        this.elements.strokeColor.value = this.randomColor();
        this.elements.glowColor.value = this.randomColor();

        // Border settings
        this.elements.borderWidth.value = Math.floor(Math.random() * 8);
        const borderStyles = ['solid', 'dashed', 'dotted'];
        const borderWeights = [8, 2, 1]; // Prefer solid
        this.elements.borderStyle.value = this.weightedRandom(borderStyles, borderWeights);
        this.elements.cornerRadius.value = Math.floor(Math.random() * 20);

        // Effects with lower probability for extreme effects
        this.elements.textShadow.checked = Math.random() > 0.6;  // 40% chance
        this.elements.textStroke.checked = Math.random() > 0.8;  // 20% chance
        this.elements.textGlow.checked = Math.random() > 0.8;    // 20% chance
        this.elements.hologram.checked = Math.random() > 0.95;   // 5% chance
        this.elements.neon.checked = Math.random() > 0.9;        // 10% chance
        this.elements.metallic.checked = Math.random() > 0.9;    // 10% chance
        this.elements.chrome.checked = Math.random() > 0.95;     // 5% chance
        this.elements.rainbow.checked = Math.random() > 0.98;    // 2% chance
        this.elements.glitch.checked = Math.random() > 0.98;     // 2% chance

        // Update range value displays
        this.updateRangeDisplays();

        // Update UI and preview
        this.toggleBackgroundControls();
        this.setupEffectToggles();
        this.updatePreview();
        this.updateStats();
    }

    updateRangeDisplays() {
        const rangeElements = [
            { id: 'fontSize', unit: 'px' },
            { id: 'letterSpacing', unit: 'px' },
            { id: 'textSkew', unit: '°' },
            { id: 'gradientAngle', unit: '°' },
            { id: 'patternSize', unit: 'px' },
            { id: 'noiseIntensity', unit: '%' },
            { id: 'noiseScale', unit: 'x' },
            { id: 'borderWidth', unit: 'px' },
            { id: 'cornerRadius', unit: 'px' }
        ];

        rangeElements.forEach(({ id, unit }) => {
            const element = this.elements[id];
            const valueDisplay = this.elements[id + 'Value'];
            if (element && valueDisplay) {
                valueDisplay.textContent = element.value + unit;
            }
        });
    }

    randomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    }

    // Export Functions
    exportSettings() {
        const settings = this.getSettings();
        const dataStr = JSON.stringify(settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = 'signpack-settings.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    exportSkinJson() {
        const skinJson = this.createSkinJson();
        const dataStr = JSON.stringify(skinJson, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'Skin.json');
        linkElement.click();
    }

    exportSingleSign() {
        const link = document.createElement('a');
        link.download = 'checkpoint-sign.png';
        link.href = this.canvases.cp1.toDataURL();
        link.click();
    }

    exportPreview() {
        // Create a combined preview image
        const combinedCanvas = document.createElement('canvas');
        const ctx = combinedCanvas.getContext('2d');

        const canvasWidth = this.canvases.cp1.width;
        const canvasHeight = this.canvases.cp1.height;

        combinedCanvas.width = canvasWidth;
        combinedCanvas.height = canvasHeight * 3 + 40; // Space for labels

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

        // Draw labels and canvases
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';

        let yPos = 20;

        ['CP 1', 'CP 50', 'CP 100'].forEach((label, index) => {
            ctx.fillText(label, canvasWidth / 2, yPos);
            yPos += 20;

            const canvas = Object.values(this.canvases)[index];
            ctx.drawImage(canvas, 0, yPos);
            yPos += canvasHeight + 20;
        });

        const link = document.createElement('a');
        link.download = 'checkpoint-preview.png';
        link.href = combinedCanvas.toDataURL();
        link.click();
    }

    validatePackConfiguration() {
        const errors = [];

        // Validate checkpoint range if enabled
        if (this.elements.includeCheckpoints?.checked) {
            const start = parseInt(this.elements.cpStartNumber?.value);
            const end = parseInt(this.elements.cpEndNumber?.value);

            if (isNaN(start) || isNaN(end)) {
                errors.push('• Checkpoint range: Start and end numbers must be valid numbers');
            } else if (start < 1) {
                errors.push('• Checkpoint range: Start number must be at least 1');
            } else if (end < start) {
                errors.push('• Checkpoint range: End number must be greater than or equal to start number');
            } else if (end > 999) {
                errors.push('• Checkpoint range: End number cannot exceed 999');
            } else if ((end - start + 1) > 500) {
                errors.push('• Checkpoint range: Cannot generate more than 500 checkpoints (consider splitting into multiple packs)');
            }

            const prefix = this.elements.checkpointPrefix?.value?.trim();
            if (!prefix || prefix.length === 0) {
                errors.push('• Checkpoint prefix: Cannot be empty');
            } else if (prefix.length > 50) {
                errors.push('• Checkpoint prefix: Maximum 50 characters');
            }
        }

        // Validate START text if enabled
        if (this.elements.includeStart?.checked) {
            const startText = this.elements.startText?.value?.trim();
            if (!startText || startText.length === 0) {
                errors.push('• START sign: Text cannot be empty');
            } else if (startText.length > 100) {
                errors.push('• START sign: Text maximum 100 characters');
            }
        }

        // Validate FINISH text if enabled
        if (this.elements.includeFinish?.checked) {
            const finishText = this.elements.finishText?.value?.trim();
            if (!finishText || finishText.length === 0) {
                errors.push('• FINISH sign: Text cannot be empty');
            } else if (finishText.length > 100) {
                errors.push('• FINISH sign: Text maximum 100 characters');
            }
        }

        // Validate at least one arrow is selected if arrows are enabled
        if (this.elements.includeArrows?.checked) {
            const hasArrow = ['arrowUp', 'arrowDown', 'arrowLeft', 'arrowRight',
                              'arrowUpLeft', 'arrowUpRight', 'arrowDownLeft', 'arrowDownRight']
                .some(id => this.elements[id]?.checked);

            if (!hasArrow) {
                errors.push('• Arrows: At least one direction must be selected');
            }
        }

        // Validate pack name
        const packName = this.elements.packName?.value?.trim();
        if (!packName || packName.length === 0) {
            errors.push('• Pack name: Cannot be empty');
        } else if (packName.length > 100) {
            errors.push('• Pack name: Maximum 100 characters');
        }

        // Validate file prefix if provided
        const filePrefix = this.elements.filePrefix?.value?.trim();
        if (filePrefix && filePrefix.length > 50) {
            errors.push('• File prefix: Maximum 50 characters');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    getSignsToGenerate() {
        const signs = [];
        const checkpointPrefix = this.elements.checkpointPrefix?.value || 'Checkpoint';
        const startText = this.elements.startText?.value || 'START';
        const finishText = this.elements.finishText?.value || 'FINISH';

        // Checkpoints
        if (this.elements.includeCheckpoints?.checked) {
            const start = parseInt(this.elements.cpStartNumber?.value || 1);
            const end = parseInt(this.elements.cpEndNumber?.value || 100);

            for (let i = start; i <= end; i++) {
                const text = `${checkpointPrefix} ${i}`;
                const paddedNum = String(i).padStart(3, '0');
                signs.push({
                    type: 'checkpoint',
                    text: text,
                    filename: `cp-${paddedNum}.png`
                });
            }
        }

        // START sign
        if (this.elements.includeStart?.checked) {
            signs.push({
                type: 'start',
                text: startText,
                filename: 'start.png'
            });
        }

        // FINISH sign
        if (this.elements.includeFinish?.checked) {
            signs.push({
                type: 'finish',
                text: finishText,
                filename: 'finish.png'
            });
        }

        // Arrows
        if (this.elements.includeArrows?.checked) {
            const arrowMode = this.elements.arrowMode?.value || 'rotated';

            if (arrowMode === 'rotated') {
                // Rotated arrow mode - use up arrow rotated to different angles
                const arrows = [
                    { check: 'arrowUp', rotation: 0, name: 'up' },
                    { check: 'arrowRight', rotation: 90, name: 'right' },
                    { check: 'arrowDown', rotation: 180, name: 'down' },
                    { check: 'arrowLeft', rotation: 270, name: 'left' },
                    { check: 'arrowUpRight', rotation: 45, name: 'up-right' },
                    { check: 'arrowDownRight', rotation: 135, name: 'down-right' },
                    { check: 'arrowDownLeft', rotation: 225, name: 'down-left' },
                    { check: 'arrowUpLeft', rotation: 315, name: 'up-left' }
                ];

                arrows.forEach(arrow => {
                    if (this.elements[arrow.check]?.checked) {
                        signs.push({
                            type: 'arrow',
                            text: '↑',
                            rotation: arrow.rotation,
                            filename: `arrow-${arrow.name}.png`
                        });
                    }
                });
            } else {
                // Character arrow mode - use font-dependent arrow characters
                const arrows = [
                    { check: 'arrowUp', text: '↑', name: 'up' },
                    { check: 'arrowDown', text: '↓', name: 'down' },
                    { check: 'arrowLeft', text: '←', name: 'left' },
                    { check: 'arrowRight', text: '→', name: 'right' },
                    { check: 'arrowUpLeft', text: '↖', name: 'up-left' },
                    { check: 'arrowUpRight', text: '↗', name: 'up-right' },
                    { check: 'arrowDownLeft', text: '↙', name: 'down-left' },
                    { check: 'arrowDownRight', text: '↘', name: 'down-right' }
                ];

                arrows.forEach(arrow => {
                    if (this.elements[arrow.check]?.checked) {
                        signs.push({
                            type: 'arrow',
                            text: arrow.text,
                            filename: `arrow-${arrow.name}.png`
                        });
                    }
                });
            }
        }

        // Icons - new icon system
        const includeIcons = document.getElementById('includeIcons')?.checked;
        if (includeIcons && this.selectedIcons) {
            // Add selected arrow icons
            if (this.selectedIcons.arrows && this.selectedIcons.arrows.size > 0) {
                this.selectedIcons.arrows.forEach(iconId => {
                    signs.push({
                        type: 'icon',
                        iconCategory: 'arrows',
                        iconId: iconId,
                        filename: `icon-arrow-${iconId}.png`
                    });
                });
            }

            // Add selected race icons
            if (this.selectedIcons.race && this.selectedIcons.race.size > 0) {
                this.selectedIcons.race.forEach(iconId => {
                    signs.push({
                        type: 'icon',
                        iconCategory: 'race',
                        iconId: iconId,
                        filename: `icon-race-${iconId}.png`
                    });
                });
            }
        }

        return signs;
    }

    // Generation and Download
    async generateSignpack() {
        const dimensions = this.getSignDimensions();

        // Calculate total signs from all selected types
        const signsTogenerate = this.getSignsToGenerate();
        const totalSigns = signsTogenerate.length;

        // Pre-generation validation
        const validation = this.validatePackConfiguration();
        if (!validation.valid) {
            alert(`❌ Validation Error:\n\n${validation.errors.join('\n')}`);
            return;
        }

        if (totalSigns === 0) {
            alert('❌ Please select at least one sign type to generate');
            return;
        }

        if (totalSigns > 200) {
            const proceed = confirm(`⚠️ You're generating ${totalSigns} signs. This may take a while. Continue?`);
            if (!proceed) return;
        }

        this.elements.generateBtn.disabled = true;
        this.elements.progressContainer.classList.add('active');
        this.elements.downloadSection.classList.remove('active');
        this.updateStatus('Initializing signpack generation...');
        this.updateProgress(0);

        try {
            // Check if JSZip is available
            if (typeof JSZip === 'undefined') {
                throw new Error('JSZip library not loaded. Please refresh the page and try again.');
            }

            const zip = new JSZip();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Could not create canvas context. Your browser may not support this feature.');
            }

            canvas.width = dimensions.width;
            canvas.height = dimensions.height;

            // Ensure fonts are loaded before generation
            await this.loadFonts();

            const filePrefix = this.elements.filePrefix?.value || '';

            // Generate all signs
            let currentIndex = 0;
            for (const sign of signsTogenerate) {
                currentIndex++;
                this.updateStatus(`Generating ${sign.type} (${currentIndex}/${totalSigns})...`);
                this.updateProgress((currentIndex / totalSigns) * 90);

                // Clear and draw the sign
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw based on sign type
                if (sign.type === 'icon') {
                    this.drawIconSign(ctx, dimensions.width, dimensions.height, sign.iconCategory, sign.iconId);
                } else {
                    this.drawSign(ctx, dimensions.width, dimensions.height, sign.text, sign.rotation);
                }

                try {
                    const blob = await this.canvasToBlob(canvas);
                    if (!blob) {
                        throw new Error(`Failed to generate image for ${sign.filename}`);
                    }

                    // Add file prefix if specified
                    const filename = filePrefix ? `${filePrefix}-${sign.filename}` : sign.filename;
                    zip.file(filename, blob);

                } catch (blobError) {
                    console.warn(`Error generating sign ${sign.filename}:`, blobError);
                    // Continue with next sign
                }

                // Small delay to prevent browser freezing
                if (currentIndex % 10 === 0) {
                    await this.sleep(50);
                } else {
                    await this.sleep(5);
                }
            }

            // Note: No Skin.json needed for single PNG checkpoint signs
            // Skin.json is only for multi-layered parallax signs with .dds files

            // Add settings JSON if enabled
            if (this.elements.includeJSON && this.elements.includeJSON.checked) {
                const settings = this.getSettings();
                const settingsWithConfig = {
                    ...settings,
                    _metadata: {
                        generatedBy: 'Trackmania Signpack Generator',
                        timestamp: new Date().toISOString(),
                        signpackName: this.elements.signpackName?.value || 'Checkpoint Signpack',
                        numberFormat: this.elements.numberFormat?.value || '001',
                        fileNaming: this.elements.fileNaming?.value || 'Checkpoint',
                        numberRange: {
                            start: startNum,
                            end: endNum
                        }
                    }
                };
                zip.file('settings.json', JSON.stringify(settingsWithConfig, null, 2));
            }

            this.updateStatus('Creating ZIP file...');
            this.updateProgress(95);

            this.generatedZip = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 6
                }
            });

            this.updateStatus('');
            this.updateProgress(100);
            this.elements.downloadSection.classList.add('active');

        } catch (error) {
            this.updateStatus(`Error: ${error.message}`);
            console.error('Generation error:', error);
            alert(`Failed to generate signpack: ${error.message}`);
        } finally {
            this.elements.generateBtn.disabled = false;
        }
    }


    canvasToBlob(canvas) {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Debounce utility for performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    updateStatus(message) {
        this.elements.status.textContent = message;
    }

    updateProgress(percent) {
        this.elements.progressBar.style.width = `${percent}%`;
    }

    downloadSignpack() {
        if (!this.generatedZip) {
            alert('No signpack generated yet!');
            return;
        }

        const packName = (this.elements.packName?.value || 'Trackmania-Signs').replace(/\s+/g, '-');
        const settings = this.getSettings();
        const filename = `${packName}_${settings.signFormat}.zip`;

        const url = URL.createObjectURL(this.generatedZip);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Global functions for UI interactions
let generator;

// Debug function to check generator status
function checkGenerator() {
    console.log('Generator status:');
    console.log('- generator exists:', !!generator);
    if (generator) {
        console.log('- generator.initialized:', generator.initialized);
        console.log('- generator.elements exists:', !!generator.elements);
        console.log('- generator.canvases exist:', Object.keys(generator.canvases || {}).length > 0);
        console.log('- loaded fonts count:', generator.loadedFonts ? generator.loadedFonts.size : 'N/A');
    }
}

function toggleTool(header) {
    const content = header.nextElementSibling;
    const isActive = header.classList.contains('active');

    // Close all sections
    document.querySelectorAll('.tool-header').forEach(h => h.classList.remove('active'));
    document.querySelectorAll('.tool-content').forEach(c => c.classList.remove('active'));

    // Open clicked section if it wasn't active
    if (!isActive) {
        header.classList.add('active');
        content.classList.add('active');
    }
}

function handleKeyDown(event, element) {
    // Handle Enter and Space key presses for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleTool(element);
    }
}

function applyTheme(themeName) {
    const themes = {
        racing: {
            backgroundType: 'linear',
            gradientColor1: '#ff4757',
            gradientColor2: '#2f1b14',
            textColor: '#ffffff',
            fontFamily: 'Impact',
            borderColor: '#ffffff',
            borderWidth: 3
        },
        cyber: {
            backgroundType: 'linear',
            gradientColor1: '#00d2d3',
            gradientColor2: '#1a1a2e',
            textColor: '#00ff41',
            fontFamily: 'Orbitron',
            neon: true,
            borderColor: '#00ff41'
        },
        neon: {
            backgroundType: 'solid',
            backgroundColor: '#000000',
            textColor: '#ff006e',
            fontFamily: 'Audiowide',
            textGlow: true,
            glowColor: '#ff006e',
            glowIntensity: 15
        },
        military: {
            backgroundType: 'pattern',
            backgroundColor: '#2d5016',
            patternType: 'stripes',
            patternColor: '#1a2e0a',
            textColor: '#ffffff',
            fontFamily: 'Oswald',
            borderColor: '#5a8a30'
        },
        space: {
            backgroundType: 'noise',
            backgroundColor: '#1a1a2e',
            patternColor: '#16213e',
            textColor: '#ffffff',
            fontFamily: 'Exo 2',
            chrome: true
        },
        gold: {
            backgroundType: 'radial',
            gradientColor1: '#ffd700',
            gradientColor2: '#b8860b',
            textColor: '#000000',
            fontFamily: 'Georgia',
            metallic: true,
            borderColor: '#8b7355'
        },
        retro: {
            backgroundType: 'pattern',
            backgroundColor: '#ff6b35',
            patternType: 'waves',
            patternColor: '#f7931e',
            textColor: '#2e1114',
            fontFamily: 'Press Start 2P',
            textStroke: true,
            strokeColor: '#ffffff'
        },
        matrix: {
            backgroundType: 'solid',
            backgroundColor: '#000000',
            textColor: '#00ff00',
            fontFamily: 'Courier New',
            textGlow: true,
            glowColor: '#00ff00',
            glowIntensity: 10
        },
        clan: {
            textPrefix: 'CLAN',
            fontSize: 70,
            fontFamily: 'Bebas Neue',
            fontWeight: '400',
            textColor: '#FFD700',
            textTransform: 'uppercase',
            backgroundType: 'solid',
            backgroundColor: '#1a1a1a',
            textShadow: true,
            shadowColor: '#000000',
            shadowBlur: 6,
            textStroke: true,
            strokeColor: '#000000',
            strokeWidth: 3,
            borderWidth: 4,
            borderColor: '#FFD700'
        },
        minimalist: {
            textPrefix: 'CP',
            fontSize: 60,
            fontFamily: 'Inter',
            fontWeight: '600',
            textColor: '#2c3e50',
            backgroundType: 'solid',
            backgroundColor: '#ffffff',
            textShadow: true,
            shadowColor: '#bdc3c7',
            shadowBlur: 2,
            borderWidth: 2,
            borderColor: '#95a5a6',
            cornerRadius: 8
        },
        speedrun: {
            textPrefix: '⚡',
            fontSize: 80,
            fontFamily: 'Racing Sans One',
            textColor: '#ff0000',
            backgroundType: 'solid',
            backgroundColor: '#ffff00',
            textStroke: true,
            strokeColor: '#000000',
            strokeWidth: 4,
            borderWidth: 6,
            borderColor: '#000000'
        },
        rainbow: {
            textPrefix: '✨',
            fontSize: 75,
            fontFamily: 'Fredoka One',
            textColor: '#ff00ff',
            textTransform: 'uppercase',
            backgroundType: 'linear',
            gradientColor1: '#ff0080',
            gradientColor2: '#00ffff',
            gradientAngle: 90,
            textShadow: true,
            shadowColor: '#000000',
            textStroke: true,
            strokeColor: '#ffffff',
            strokeWidth: 3,
            rainbow: true,
            borderWidth: 5,
            borderColor: '#ffffff',
            cornerRadius: 10
        },
        darkpro: {
            textPrefix: 'CP',
            fontSize: 68,
            fontFamily: 'Poppins',
            fontWeight: '600',
            textColor: '#ffffff',
            textTransform: 'uppercase',
            backgroundType: 'linear',
            backgroundColor: '#0a0a0a',
            gradientColor1: '#1a1a1a',
            gradientColor2: '#0a0a0a',
            gradientAngle: 180,
            patternType: 'carbon',
            patternColor: '#151515',
            textShadow: true,
            shadowColor: '#4facfe',
            shadowBlur: 10,
            textGlow: true,
            glowColor: '#4facfe',
            glowIntensity: 8,
            borderWidth: 2,
            borderColor: '#333333',
            cornerRadius: 6
        }
    };

    const theme = themes[themeName];
    if (!theme || !generator) return;

    generator.applySettings(theme);
}


function savePreset() {
    if (!generator) {
        console.error('Generator not initialized yet. Please wait a moment and try again.');
        alert('Generator not initialized yet. Please wait a moment and try again.');
        return;
    }

    try {
        const name = prompt('Enter preset name:');
        if (name && name.trim()) {
            const settings = generator.getSettings();
            generator.presets[name.trim()] = settings;
            generator.savePresetsToStorage();
            generator.displayPresets();
            alert(`Preset "${name.trim()}" saved successfully!`);
        }
    } catch (error) {
        console.error('Error saving preset:', error);
        alert('Error saving preset. Please try again.');
    }
}

function loadPreset() {
    if (!generator) {
        alert('Generator not initialized');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const settings = JSON.parse(event.target.result);
                    generator.applySettings(settings);
                    alert('Settings loaded successfully!');
                } catch (error) {
                    alert('Error loading settings: Invalid file format');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function exportSettings() {
    if (!generator) {
        alert('Generator not initialized');
        return;
    }
    generator.exportSettings();
}

function exportSkinJson() {
    if (!generator) {
        alert('Generator not initialized');
        return;
    }
    generator.exportSkinJson();
}

function exportSingleSign() {
    if (!generator) {
        alert('Generator not initialized');
        return;
    }
    generator.exportSingleSign();
}

function exportPreview() {
    if (!generator) {
        alert('Generator not initialized');
        return;
    }
    generator.exportPreview();
}

function applyBatchOperation() {
    if (!generator) {
        alert('Generator not initialized');
        return;
    }
    generator.applyBatchOperation();
}

function randomizeAll() {
    if (!generator) {
        console.error('Generator not initialized yet. Please wait a moment and try again.');
        alert('Generator not initialized yet. Please wait a moment and try again.');
        return;
    }

    if (!generator.initialized) {
        console.warn('Generator still loading fonts. Please wait a moment...');
        alert('Generator is still loading. Please wait a moment and try again.');
        return;
    }

    try {
        generator.randomizeAll();
    } catch (error) {
        console.error('Error randomizing settings:', error);
        alert('Error randomizing settings. Please try again.');
    }
}

function generateSignpack() {
    if (!generator) {
        console.error('Generator not initialized yet. Please wait a moment and try again.');
        alert('Generator not initialized yet. Please wait a moment and try again.');
        return;
    }

    try {
        generator.generateSignpack();
    } catch (error) {
        console.error('Error generating signpack:', error);
        alert('Error generating signpack. Please try again.');
    }
}

// Quick checkpoint range preset function
function setCheckpointRange(start, end) {
    const cpStartInput = document.getElementById('cpStartNumber');
    const cpEndInput = document.getElementById('cpEndNumber');
    const includeCheckpoints = document.getElementById('includeCheckpoints');

    if (cpStartInput && cpEndInput) {
        cpStartInput.value = start;
        cpEndInput.value = end;

        // Ensure checkpoints are enabled
        if (includeCheckpoints && !includeCheckpoints.checked) {
            includeCheckpoints.checked = true;
            includeCheckpoints.dispatchEvent(new Event('change'));
        }

        // Trigger update
        if (window.generator) {
            window.generator.updatePackSummary();
            window.generator.updatePreview();
        }
    }
}

// Tab switching functionality
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);

    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.style.display = 'none';
    });

    // Remove active class from all tabs
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });

    // Show selected panel and activate corresponding tab
    const panel = document.getElementById(tabName + '-panel');
    const tab = document.getElementById(tabName + '-tab');

    if (panel) {
        panel.style.display = 'block';
    }

    if (tab) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
    }
}

// Keyboard navigation for tabs
function handleTabKeyDown(event, tabName) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        switchTab(tabName);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const tabs = Array.from(document.querySelectorAll('.panel-tab'));
        const currentIndex = tabs.findIndex(tab => tab.classList.contains('active'));
        let nextIndex;

        if (event.key === 'ArrowLeft') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
            nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }

        tabs[nextIndex].focus();
        tabs[nextIndex].click();
    }
}

// Themes modal functionality
function toggleThemesModal() {
    const modal = document.getElementById('themesModal');
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
}

function toggleHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
}

// Enhanced theme application (closes modal after selection)
function applyThemeAndCloseModal(themeName) {
    // Close the themes modal first
    const modal = document.getElementById('themesModal');
    modal.style.display = 'none';

    // Call the original applyTheme function
    if (typeof applyTheme === 'function') {
        applyTheme(themeName);
    } else {
        console.error('applyTheme function not found');
    }
}

// Expose all functions to global scope for onclick handlers
// (Required because ES6 modules have their own scope)
window.generator = null; // Will be set after initialization
window.checkGenerator = checkGenerator;
window.toggleTool = toggleTool;
window.toggleThemesModal = toggleThemesModal;
window.applyThemeAndCloseModal = applyThemeAndCloseModal;
window.applyTheme = applyTheme;
window.savePreset = savePreset;
window.loadPreset = loadPreset;
window.exportSettings = exportSettings;
window.randomizeAll = randomizeAll;
window.generateSignpack = generateSignpack;
window.toggleHelpModal = toggleHelpModal;
window.switchTab = switchTab;
window.handleTabKeyDown = handleTabKeyDown;
window.setCheckpointRange = setCheckpointRange;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Show loading indicator
        console.log('Initializing Trackmania Signpack Generator...');

        // Initialize the generator
        generator = new TrackmaniaSignpackGenerator();
        window.generator = generator; // Expose to global scope for onclick handlers

        // Wait a bit for full initialization
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('Generator initialized successfully');

        // Add modal event handlers
        document.addEventListener('click', function(event) {
            const modal = document.getElementById('themesModal');
            if (event.target === modal) {
                toggleThemesModal();
            }
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                const modal = document.getElementById('themesModal');
                if (modal && modal.style.display === 'flex') {
                    toggleThemesModal();
                }
            }
        });

        // Initialize background type handler
        const backgroundTypeSelect = document.getElementById('backgroundType');
        if (backgroundTypeSelect && generator) {
            backgroundTypeSelect.addEventListener('change', () => {
                if (generator && generator.toggleBackgroundControls) {
                    generator.toggleBackgroundControls();
                }
            });
        }

        // Initialize range value displays
        document.querySelectorAll('input[type="range"]').forEach(input => {
            const valueDisplay = document.getElementById(input.id + 'Value');
            if (valueDisplay) {
                const updateValue = () => {
                    let value = input.value;
                    let unit = 'px';

                    // Special cases for different units
                    if (input.id.includes('Angle')) unit = '°';
                    else if (input.id.includes('Intensity') || input.id.includes('Opacity')) unit = '%';
                    else if (input.id.includes('Scale')) unit = 'x';

                    valueDisplay.textContent = value + unit;
                };

                // Update on input change
                input.addEventListener('input', updateValue);
                // Initialize display
                updateValue();
            }
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!generator) return;

            if (e.ctrlKey && e.key === 'g') {
                e.preventDefault();
                generator.generateSignpack();
            }
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                generator.exportSettings();
            }
        });

        // Abstract background randomize seed button
        const randomizeAbstractSeed = document.getElementById('randomizeAbstractSeed');
        if (randomizeAbstractSeed) {
            randomizeAbstractSeed.addEventListener('click', () => {
                const seedInput = document.getElementById('abstractSeed');
                if (seedInput) {
                    seedInput.value = Math.floor(Math.random() * 10000);
                    if (generator) {
                        generator.updatePreview();
                    }
                }
            });
        }

        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            @keyframes glow {
                0%, 100% { filter: drop-shadow(0 0 5px rgba(79, 172, 254, 0.3)); }
                50% { filter: drop-shadow(0 0 20px rgba(79, 172, 254, 0.8)); }
            }
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .loading {
                opacity: 0.5;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);

    } catch (error) {
        console.error('Failed to initialize generator:', error);
        alert('Failed to initialize the Signpack Generator. Please refresh the page and try again.');
    }
});