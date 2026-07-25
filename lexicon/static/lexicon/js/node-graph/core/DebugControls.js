import { ensureRelativePosition } from './domUtils';

/**
 * DebugControls
 * -------------
 * Overlay HTML (pas SVG) affichant des contrôles de debug basiques :
 * reset view, zoom+, zoom-. Reste fixe à l'écran, indépendamment du pan/zoom
 * du Viewport. À retirer ou remplacer par une vraie UI applicative plus tard.
 */
export class DebugControls {
    /**
     * @param {HTMLElement} container - le même conteneur que celui passé au Viewport
     * @param {Viewport} viewport
     * @param {object} [options]
     * @param {number} [options.zoomStep=1.2] - facteur appliqué à chaque clic zoom+/zoom-
     */
    constructor(container, viewport, options = {}) {
        this.container = container;
        this.viewport = viewport;
        this.zoomStep = options.zoomStep ?? 1.2;
        this.el = null;
    }

    /** Construit et insère l'overlay dans le conteneur. */
    render() {
        ensureRelativePosition(this.container);

        this.el = document.createElement('div');

        this.el.style.position = 'absolute';
        this.el.style.top = '8px';
        this.el.style.left = '8px';

        this.el.style.display = 'grid';
        this.el.style.gap = '4px';

        this.el.style.backgroundColor = 'white';
        this.el.style.border = '2px solid rgb(239 68 68)';
        this.el.style.padding = '4px';

        this.el.style.zIndex = '10';
        this.el.style.fontFamily = 'sans-serif';

        let rowTop = this._createRow();
        let rowZoom = this._createRow();
        let rowMove = this._createRow();
        
        rowTop.append(this._createSpan('Debug Controls'));

        rowZoom.append(
            this._createButton('-', () => this._zoomOut()),
            this._createButton('Reset', () => this._resetView()),
            this._createButton('+', () => this._zoomIn())
        );
        
        rowMove.append(
            this._createButton('←', () => this._moveLeft()),
            this._createButton('→', () => this._moveRight()),
            this._createButton('↑', () => this._moveUp()),
            this._createButton('↓', () => this._moveDown())
        );

        this.el.append(rowTop, rowZoom, rowMove);

        this.container.append(this.el);
    }

    /** Retire l'overlay du DOM. */
    destroy() {
        this.el?.remove();
        this.el = null;
    }

    // --- Actions ---

    _zoomIn() {
        this._zoomCenter(this.zoomStep);
    }

    _zoomOut() {
        this._zoomCenter(1 / this.zoomStep);
    }

    _resetView() {
        this.viewport.reset();
    }

    _moveLeft() {
        this.viewport.panBy(-this.zoomStep*10, 0);
    }

    _moveRight() {
        this.viewport.panBy(this.zoomStep*10, 0);
    }

    _moveUp() {
        this.viewport.panBy(0, -this.zoomStep*10);
    }

    _moveDown() {
        this.viewport.panBy(0, this.zoomStep*10);
    }

    /** Zoome en gardant fixe le centre visuel du conteneur (pas la position souris). */
    _zoomCenter(factor) {
        const rect = this.viewport.svg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        this.viewport.zoomAt(centerX, centerY, factor);
    }

    _createButton(label, onClick) {
        const button = document.createElement('button');

        button.append(this._createSpan(label));

        button.type = 'button';

        button.style.minWidth = '32px';
        button.style.height = '32px';
        button.style.cursor = 'pointer';
        button.style.border = '1px solid black';
        button.style.backgroundColor = 'rgb(240 240 240)';
        button.style.padding = '4px 8px';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';

        button.addEventListener('click', onClick);

        return button;
    }

    _createRow() {
        const row = document.createElement('div');

        row.style.display = 'flex';
        row.style.gap = '4px';

        return row;
    }

    _createSpan(text) {
        const span = document.createElement('span');
        span.textContent = text;
        return span;
    }
}