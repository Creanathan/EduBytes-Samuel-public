/**
 * Responsive Scaling Service - EduBytes
 * Syncs the .interactable-layer dimensions with the "contained" room background image.
 * This ensures hitboxes stay perfectly aligned regardless of image size or window aspect ratio.
 */

window.ResponsiveScaler = {
    init() {
        this.sync();
        window.addEventListener('resize', () => this.sync());
        // Also sync after image might have loaded
        window.addEventListener('load', () => this.sync());
    },

    sync() {
        const bg = document.querySelector('.room-background');
        if (!bg) return;

        const layer = document.querySelector('.interactable-layer');

        // --- Atmospheric Background Logic ---
        let ambient = document.querySelector('.room-background-ambient');
        if (!ambient) {
            ambient = document.createElement('div');
            ambient.className = 'room-background-ambient';
            bg.parentNode.insertBefore(ambient, bg);
        }

        // Get the actual image dimensions
        const style = window.getComputedStyle(bg);
        const bgImgUrl = style.backgroundImage;
        
        // Sync ambient background image
        if (ambient.style.backgroundImage !== bgImgUrl) {
            ambient.style.backgroundImage = bgImgUrl;
        }

        const bgImg = bgImgUrl.slice(4, -1).replace(/"/g, "");
        if (!bgImg || bgImg === 'none') return;

        const img = new Image();
        img.src = bgImg;
        img.onload = () => {
            const imgRatio = img.width / img.height;
            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;
            const winRatio = winWidth / winHeight;

            let actualWidth, actualHeight, offsetLeft, offsetTop;

            if (winRatio > imgRatio) {
                // Window is wider than image (bars on sides)
                actualHeight = winHeight;
                actualWidth = winHeight * imgRatio;
                offsetTop = 0;
                offsetLeft = (winWidth - actualWidth) / 2;
            } else {
                // Window is taller than image (bars on top/bottom)
                actualWidth = winWidth;
                actualHeight = winWidth / imgRatio;
                offsetLeft = 0;
                offsetTop = (winHeight - actualHeight) / 2;
            }

            // Apply dimensions to the layer if it exists
            if (layer) {
                layer.style.width = actualWidth + 'px';
                layer.style.height = actualHeight + 'px';
                layer.style.left = offsetLeft + 'px';
                layer.style.top = offsetTop + 'px';
            }
        };
    }
};

document.addEventListener('DOMContentLoaded', () => window.ResponsiveScaler.init());
