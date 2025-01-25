import { useState } from 'react';

const ThemeChanger = () => {
    const [bgColor, setBgColor] = useState('#e6e6e6');
    const [textColor, setTextColor] = useState('#ffffff');

    // Function to calculate appropriate text color (black/white) based on background
    const getContrastColor = (hex) => {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);

        // Calculate luminance to decide the font color
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';  // Black for lighter bg, White for darker bg
    };

    const handleColorChange = (e) => {
        const selectedColor = e.target.value;
        setBgColor(selectedColor);
        setTextColor(getContrastColor(selectedColor));

        // Apply the new styles globally
        document.documentElement.style.setProperty('--main-bg-color', selectedColor);
        document.documentElement.style.setProperty('--main-text-color', getContrastColor(selectedColor));
    };

    return (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <label style={{ color: 'var(--main-text-color)', marginRight: '10px' }}>Choose Theme:</label>
            <input
                type="color"
                value={bgColor}
                onChange={handleColorChange}
                style={{
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    padding: 0,
                    outline: 'none',
                    outlineColor: 'transparent',
                    background: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                }}
            />
        </div>
    );
};

export default ThemeChanger;
