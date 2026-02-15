const palette = document.getElementById('palette');
const generateBtn = document.getElementById('generateBtn');
const notification = document.getElementById('notification');

function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createColorBox(color) {
    const box = document.createElement('div');
    box.className = 'color-box';
    box.style.backgroundColor = color;
    
    const info = document.createElement('div');
    info.className = 'color-info';
    info.textContent = color;
    
    box.appendChild(info);
    
    box.addEventListener('click', () => {
        navigator.clipboard.writeText(color).then(() => {
            showNotification();
        });
    });
    
    return box;
}

function generatePalette() {
    palette.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const color = generateRandomColor();
        palette.appendChild(createColorBox(color));
    }
}

function showNotification() {
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

generateBtn.addEventListener('click', generatePalette);

generatePalette();

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        generatePalette();
    }
});