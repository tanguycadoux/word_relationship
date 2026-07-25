import { ensureRelativePosition, markAsOverlay } from "../node-graph/index.js";

export class WordGraphLegend {
    /**
     * @param {HTMLElement} container
     * @param {Record<string, string>} languageColors
     */
    constructor(container, languageColors) {
        this.container = container;
        this.languageColors = languageColors;
        this.el = null;
    }

    render() {
        ensureRelativePosition(this.container);

        this.el = document.createElement('div');
        markAsOverlay(this.el);
        this.el.style.position = 'absolute';
        this.el.style.bottom = '8px';
        this.el.style.left = '8px';
        this.el.style.zIndex = '10';
        this.el.style.display = 'flex';
        this.el.style.flexDirection = 'column';
        this.el.style.gap = '4px';
        this.el.style.padding = '8px';
        this.el.style.background = 'rgba(255, 255, 255, 65%)';
        this.el.style.border = '1px solid #ddd';
        this.el.style.borderRadius = '4px';
        this.el.style.backdropFilter = 'blur(8px)';
        this.el.style.fontFamily = 'sans-serif';
        this.el.style.fontSize = '12px';

        Object.entries(this.languageColors).forEach(([language, color]) => {
            this.el.appendChild(this._createEntry(language, color));
        });

        this.container.appendChild(this.el);
    }

    destroy() {
        this.el?.remove();
        this.el = null;
    }

    _createEntry(label, color) {
        const entry = document.createElement('div');
        entry.style.display = 'flex';
        entry.style.alignItems = 'center';
        entry.style.gap = '6px';

        const swatch = document.createElement('span');
        swatch.style.width = '10px';
        swatch.style.height = '10px';
        swatch.style.borderRadius = '2px';
        swatch.style.background = color;

        const text = document.createElement('span');
        text.textContent = label;

        entry.appendChild(swatch);
        entry.appendChild(text);
        return entry;
    }
}