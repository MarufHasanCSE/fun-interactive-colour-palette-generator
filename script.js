const palette = document.getElementById('palette');
const generateBtn = document.getElementById('generateBtn');
const notification = document.getElementById('notification');
const colorCount = document.getElementById('colorCount');
const colorCountValue = document.getElementById('colorCountValue');
const colorMode = document.getElementById('colorMode');
const exportBtn = document.getElementById('exportBtn');
const lockBtn = document.getElementById('lockBtn');
const exportModal = document.getElementById('exportModal');
const closeModal = document.querySelector('.close');
const savedPalettesContainer = document.getElementById('savedPalettesContainer');
const autoGenerate = document.getElementById('autoGenerate');
const imageUploadBtn = document.getElementById('imageUploadBtn');
const imageInput = document.getElementById('imageInput');
const gradientBtn = document.getElementById('gradientBtn');
const gradientPreview = document.getElementById('gradientPreview');
const contrastBtn = document.getElementById('contrastBtn');
const contrastChecker = document.getElementById('contrastChecker');
const contrastResults = document.getElementById('contrastResults');
const shuffleBtn = document.getElementById('shuffleBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const hueSlider = document.getElementById('hueSlider');
const saturationSlider = document.getElementById('saturationSlider');
const lightnessSlider = document.getElementById('lightnessSlider');
const hueValue = document.getElementById('hueValue');
const saturationValue = document.getElementById('saturationValue');
const lightnessValue = document.getElementById('lightnessValue');
const selectedColorPreview = document.getElementById('selectedColorPreview');
const selectedColorHex = document.getElementById('selectedColorHex');
const selectedColorRgb = document.getElementById('selectedColorRgb');
const selectedColorHsl = document.getElementById('selectedColorHsl');

let currentColors = [];
let lockedColors = new Set();
let lockMode = false;
let autoGenerateInterval = null;
let selectedColorIndex = null;

function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generatePastelColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 25 + Math.random() * 25;
    const lightness = 75 + Math.random() * 15;
    return hslToHex(hue, saturation, lightness);
}

function generateVibrantColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.random() * 30;
    const lightness = 45 + Math.random() * 15;
    return hslToHex(hue, saturation, lightness);
}

function generateDarkColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 20 + Math.random() * 40;
    const lightness = 15 + Math.random() * 20;
    return hslToHex(hue, saturation, lightness);
}

function generateMonochromeColor() {
    const baseHue = Math.floor(Math.random() * 360);
    const saturation = 10 + Math.random() * 30;
    const lightness = 20 + Math.random() * 60;
    return hslToHex(baseHue, saturation, lightness);
}

function generateAnalogousColors(count) {
    const baseHue = Math.floor(Math.random() * 360);
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (baseHue + (i * 30)) % 360;
        const saturation = 50 + Math.random() * 30;
        const lightness = 45 + Math.random() * 20;
        colors.push(hslToHex(hue, saturation, lightness));
    }
    return colors;
}

function generateComplementaryColors(count) {
    const baseHue = Math.floor(Math.random() * 360);
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = i % 2 === 0 ? baseHue : (baseHue + 180) % 360;
        const saturation = 50 + Math.random() * 30;
        const lightness = 40 + Math.random() * 30;
        colors.push(hslToHex(hue, saturation, lightness));
    }
    return colors;
}

function generateTriadicColors(count) {
    const baseHue = Math.floor(Math.random() * 360);
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (baseHue + (i * 120)) % 360;
        const saturation = 50 + Math.random() * 30;
        const lightness = 45 + Math.random() * 20;
        colors.push(hslToHex(hue, saturation, lightness));
    }
    return colors;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function getColorByMode(mode, count) {
    switch(mode) {
        case 'pastel': return generatePastelColor();
        case 'vibrant': return generateVibrantColor();
        case 'dark': return generateDarkColor();
        case 'monochrome': return generateMonochromeColor();
        case 'analogous': return null;
        case 'complementary': return null;
        case 'triadic': return null;
        default: return generateRandomColor();
    }
}

function createColorBox(color, index) {
    const box = document.createElement('div');
    box.className = 'color-box';
    if (lockedColors.has(index)) {
        box.classList.add('locked');
    }
    if (index === selectedColorIndex) {
        box.classList.add('selected');
    }
    box.style.backgroundColor = color;
    box.dataset.index = index;
    
    const info = document.createElement('div');
    info.className = 'color-info';
    info.textContent = color;
    
    box.appendChild(info);
    
    box.addEventListener('click', (e) => {
        if (lockMode) {
            toggleLock(index, box);
        } else {
            selectColor(index, color);
            navigator.clipboard.writeText(color).then(() => {
                showNotification();
            });
        }
    });
    
    return box;
}

function selectColor(index, color) {
    selectedColorIndex = index;
    
    document.querySelectorAll('.color-box').forEach((box, i) => {
        if (i === index) {
            box.classList.add('selected');
        } else {
            box.classList.remove('selected');
        }
    });
    
    selectedColorPreview.style.backgroundColor = color;
    selectedColorHex.textContent = color;
    
    const rgb = hexToRgb(color);
    selectedColorRgb.textContent = `RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`;
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    selectedColorHsl.textContent = `HSL: ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
    
    hueSlider.value = hsl.h;
    saturationSlider.value = hsl.s;
    lightnessSlider.value = hsl.l;
    hueValue.textContent = hsl.h;
    saturationValue.textContent = hsl.s;
    lightnessValue.textContent = hsl.l;
}

function updateSelectedColor() {
    if (selectedColorIndex === null) return;
    
    const h = parseInt(hueSlider.value);
    const s = parseInt(saturationSlider.value);
    const l = parseInt(lightnessSlider.value);
    
    const newColor = hslToHex(h, s, l);
    currentColors[selectedColorIndex] = newColor;
    
    const colorBox = palette.children[selectedColorIndex];
    colorBox.style.backgroundColor = newColor;
    colorBox.querySelector('.color-info').textContent = newColor;
    
    selectedColorPreview.style.backgroundColor = newColor;
    selectedColorHex.textContent = newColor;
    
    const rgb = hexToRgb(newColor);
    selectedColorRgb.textContent = `RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

function toggleLock(index, box) {
    if (lockedColors.has(index)) {
        lockedColors.delete(index);
        box.classList.remove('locked');
    } else {
        lockedColors.add(index);
        box.classList.add('locked');
    }
}

function generatePalette() {
    const count = parseInt(colorCount.value);
    const mode = colorMode.value;
    
    palette.innerHTML = '';
    
    let newColors;
    
    if (mode === 'analogous') {
        newColors = generateAnalogousColors(count);
    } else if (mode === 'complementary') {
        newColors = generateComplementaryColors(count);
    } else if (mode === 'triadic') {
        newColors = generateTriadicColors(count);
    } else {
        newColors = [];
        for (let i = 0; i < count; i++) {
            if (lockedColors.has(i) && currentColors[i]) {
                newColors.push(currentColors[i]);
            } else {
                newColors.push(getColorByMode(mode, count));
            }
        }
    }
    
    currentColors = newColors;
    
    currentColors.forEach((color, i) => {
        palette.appendChild(createColorBox(color, i));
    });
    
    if (selectedColorIndex !== null && selectedColorIndex < currentColors.length) {
        selectColor(selectedColorIndex, currentColors[selectedColorIndex]);
    }
}

function showNotification(message = 'Copied to clipboard!') {
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

function exportPalette() {
    const cssVars = currentColors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n');
    const cssExport = `:root {\n${cssVars}\n}`;
    
    const jsonExport = JSON.stringify(currentColors, null, 2);
    
    const arrayExport = `const colors = ${JSON.stringify(currentColors)};`;
    
    document.getElementById('cssExport').value = cssExport;
    document.getElementById('jsonExport').value = jsonExport;
    document.getElementById('arrayExport').value = arrayExport;
    
    exportModal.style.display = 'block';
}

function savePalette() {
    const saved = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
    saved.unshift([...currentColors]);
    if (saved.length > 10) saved.pop();
    localStorage.setItem('savedPalettes', JSON.stringify(saved));
    loadSavedPalettes();
    showNotification('Palette saved to favorites!');
}

function loadSavedPalettes() {
    const saved = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
    savedPalettesContainer.innerHTML = '';
    
    if (saved.length === 0) {
        savedPalettesContainer.innerHTML = '<p style="text-align: center; color: #999;">No saved palettes yet</p>';
        return;
    }
    
    saved.forEach((colors, index) => {
        const paletteDiv = document.createElement('div');
        paletteDiv.className = 'saved-palette';
        
        const colorsDiv = document.createElement('div');
        colorsDiv.className = 'saved-palette-colors';
        
        colors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'saved-palette-color';
            colorDiv.style.backgroundColor = color;
            colorDiv.addEventListener('click', () => {
                navigator.clipboard.writeText(color);
                showNotification();
            });
            colorsDiv.appendChild(colorDiv);
        });
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'saved-palette-actions';
        
        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', () => {
            currentColors = [...colors];
            colorCount.value = colors.length;
            colorCountValue.textContent = colors.length;
            lockedColors.clear();
            generatePalette();
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            saved.splice(index, 1);
            localStorage.setItem('savedPalettes', JSON.stringify(saved));
            loadSavedPalettes();
        });
        
        actionsDiv.appendChild(loadBtn);
        actionsDiv.appendChild(deleteBtn);
        
        paletteDiv.appendChild(colorsDiv);
        paletteDiv.appendChild(actionsDiv);
        savedPalettesContainer.appendChild(paletteDiv);
    });
}

function extractColorsFromImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            const colorMap = {};
            
            for (let i = 0; i < pixels.length; i += 40) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const hex = rgbToHex(r, g, b);
                colorMap[hex] = (colorMap[hex] || 0) + 1;
            }
            
            const sortedColors = Object.entries(colorMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, parseInt(colorCount.value))
                .map(entry => entry[0]);
            
            currentColors = sortedColors;
            lockedColors.clear();
            palette.innerHTML = '';
            currentColors.forEach((color, i) => {
                palette.appendChild(createColorBox(color, i));
            });
            
            showNotification('Colors extracted from image!');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

function showGradient() {
    if (gradientPreview.style.display === 'none') {
        const gradient = `linear-gradient(to right, ${currentColors.join(', ')})`;
        gradientPreview.style.background = gradient;
        gradientPreview.style.display = 'block';
        gradientBtn.textContent = '❌ Hide Gradient';
    } else {
        gradientPreview.style.display = 'none';
        gradientBtn.textContent = '🌈 View Gradient';
    }
}

function calculateContrast(color1, color2) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const l1 = 0.2126 * Math.pow(rgb1.r/255, 2.2) + 
                0.7152 * Math.pow(rgb1.g/255, 2.2) + 
                0.0722 * Math.pow(rgb1.b/255, 2.2);
    const l2 = 0.2126 * Math.pow(rgb2.r/255, 2.2) + 
                0.7152 * Math.pow(rgb2.g/255, 2.2) + 
                0.0722 * Math.pow(rgb2.b/255, 2.2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}

function checkContrast() {
    if (contrastChecker.style.display === 'none') {
        contrastResults.innerHTML = '';
        
        for (let i = 0; i < currentColors.length; i++) {
            for (let j = i + 1; j < currentColors.length; j++) {
                const ratio = calculateContrast(currentColors[i], currentColors[j]);
                const passAA = ratio >= 4.5;
                const passAAA = ratio >= 7;
                
                const pairDiv = document.createElement('div');
                pairDiv.className = 'contrast-pair';
                
                const colorsDiv = document.createElement('div');
                colorsDiv.className = 'contrast-colors';
                
                const box1 = document.createElement('div');
                box1.className = 'contrast-color-box';
                box1.style.backgroundColor = currentColors[i];
                
                const box2 = document.createElement('div');
                box2.className = 'contrast-color-box';
                box2.style.backgroundColor = currentColors[j];
                
                colorsDiv.appendChild(box1);
                colorsDiv.appendChild(box2);
                
                const ratioSpan = document.createElement('span');
                ratioSpan.className = 'contrast-ratio';
                ratioSpan.textContent = `${ratio}:1`;
                
                const statusSpan = document.createElement('span');
                if (passAAA) {
                    statusSpan.className = 'contrast-pass';
                    statusSpan.textContent = '✓ AAA';
                } else if (passAA) {
                    statusSpan.className = 'contrast-pass';
                    statusSpan.textContent = '✓ AA';
                } else {
                    statusSpan.className = 'contrast-fail';
                    statusSpan.textContent = '✗ Fail';
                }
                
                pairDiv.appendChild(colorsDiv);
                pairDiv.appendChild(ratioSpan);
                pairDiv.appendChild(statusSpan);
                contrastResults.appendChild(pairDiv);
            }
        }
        
        contrastChecker.style.display = 'block';
        contrastBtn.textContent = '❌ Hide Contrast';
    } else {
        contrastChecker.style.display = 'none';
        contrastBtn.textContent = '👁️ Check Contrast';
    }
}

function shuffleColors() {
    for (let i = currentColors.length - 1; i > 0; i--) {
        if (!lockedColors.has(i)) {
            let j;
            do {
                j = Math.floor(Math.random() * (i + 1));
            } while (lockedColors.has(j));
            
            [currentColors[i], currentColors[j]] = [currentColors[j], currentColors[i]];
        }
    }
    
    palette.innerHTML = '';
    currentColors.forEach((color, i) => {
        palette.appendChild(createColorBox(color, i));
    });
    
    showNotification('Colors shuffled!');
}

colorCount.addEventListener('input', (e) => {
    colorCountValue.textContent = e.target.value;
    generatePalette();
});

colorMode.addEventListener('change', generatePalette);

generateBtn.addEventListener('click', generatePalette);

exportBtn.addEventListener('click', exportPalette);

favoriteBtn.addEventListener('click', savePalette);

lockBtn.addEventListener('click', () => {
    lockMode = !lockMode;
    lockBtn.textContent = lockMode ? '🔓 Lock Mode: ON' : '🔓 Lock/Unlock Colors';
    lockBtn.style.background = lockMode ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '';
    if (!lockMode) {
        showNotification('Click colors to copy hex code');
    } else {
        showNotification('Click colors to lock/unlock');
    }
});

autoGenerate.addEventListener('change', (e) => {
    if (e.target.checked) {
        autoGenerateInterval = setInterval(() => {
            generatePalette();
        }, 3000);
        showNotification('Auto-generate enabled (3s)');
    } else {
        clearInterval(autoGenerateInterval);
        showNotification('Auto-generate disabled');
    }
});

imageUploadBtn.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        extractColorsFromImage(file);
    }
});

gradientBtn.addEventListener('click', showGradient);

contrastBtn.addEventListener('click', checkContrast);

shuffleBtn.addEventListener('click', shuffleColors);

hueSlider.addEventListener('input', (e) => {
    hueValue.textContent = e.target.value;
    updateSelectedColor();
});

saturationSlider.addEventListener('input', (e) => {
    saturationValue.textContent = e.target.value;
    updateSelectedColor();
});

lightnessSlider.addEventListener('input', (e) => {
    lightnessValue.textContent = e.target.value;
    updateSelectedColor();
});

closeModal.addEventListener('click', () => {
    exportModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === exportModal) {
        exportModal.style.display = 'none';
    }
});

document.querySelectorAll('.copy-export').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = e.target.dataset.target;
        const textarea = document.getElementById(targetId);
        textarea.select();
        navigator.clipboard.writeText(textarea.value);
        showNotification('Exported code copied!');
    });
});

generatePalette();
loadSavedPalettes();

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        generatePalette();
    } else if (e.code === 'KeyS' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        savePalette();
    } else if (e.code === 'KeyG' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        showGradient();
    }
});