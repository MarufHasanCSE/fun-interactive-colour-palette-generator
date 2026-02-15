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

let currentColors = [];
let lockedColors = new Set();
let lockMode = false;

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

function getColorByMode(mode) {
    switch(mode) {
        case 'pastel': return generatePastelColor();
        case 'vibrant': return generateVibrantColor();
        case 'dark': return generateDarkColor();
        case 'monochrome': return generateMonochromeColor();
        default: return generateRandomColor();
    }
}

function createColorBox(color, index) {
    const box = document.createElement('div');
    box.className = 'color-box';
    if (lockedColors.has(index)) {
        box.classList.add('locked');
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
            navigator.clipboard.writeText(color).then(() => {
                showNotification();
            });
        }
    });
    
    return box;
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
    
    for (let i = 0; i < count; i++) {
        let color;
        if (lockedColors.has(i) && currentColors[i]) {
            color = currentColors[i];
        } else {
            color = getColorByMode(mode);
        }
        currentColors[i] = color;
        palette.appendChild(createColorBox(color, i));
    }
    
    currentColors = currentColors.slice(0, count);
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
    if (saved.length > 5) saved.pop();
    localStorage.setItem('savedPalettes', JSON.stringify(saved));
    loadSavedPalettes();
    showNotification('Palette saved!');
}

function loadSavedPalettes() {
    const saved = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
    savedPalettesContainer.innerHTML = '';
    
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

colorCount.addEventListener('input', (e) => {
    colorCountValue.textContent = e.target.value;
    generatePalette();
});

colorMode.addEventListener('change', generatePalette);

generateBtn.addEventListener('click', generatePalette);

exportBtn.addEventListener('click', exportPalette);

lockBtn.addEventListener('click', () => {
    lockMode = !lockMode;
    lockBtn.textContent = lockMode ? 'Lock Mode: ON' : 'Lock/Unlock Colors';
    lockBtn.style.background = lockMode ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '';
    if (!lockMode) {
        showNotification('Click colors to copy hex code');
    } else {
        showNotification('Click colors to lock/unlock');
    }
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
    if (e.code === 'Space') {
        e.preventDefault();
        generatePalette();
    } else if (e.code === 'KeyS' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        savePalette();
    }
});