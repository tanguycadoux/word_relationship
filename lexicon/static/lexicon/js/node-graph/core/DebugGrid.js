const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Dessine un référentiel visuel (axes + quadrillage) dans l'espace "monde",
 * pour valider visuellement le comportement du Viewport. À retirer une fois
 * GraphState/Renderer en place.
 */
export class DebugGrid {
    /**
     * @param {SVGGElement} viewportGroup - même <g> que celui utilisé par Viewport
     * @param {object} [options]
     * @param {number} [options.spacing=50]  - écart entre les lignes de quadrillage
     * @param {number} [options.extent=2000] - étendue du quadrillage de part et d'autre de l'origine
     */
    constructor(viewportGroup, options = {}) {
        if (!viewportGroup) {
            throw new Error('DebugGrid requires a viewportGroup');
        }

        this.parentGroup = viewportGroup;
        this.spacing = options.spacing ?? 50;
        this.extent = options.extent ?? 2000;
        this.gridGroup = null;
    }

    /** Construit et insère les éléments SVG (grille + axes X/Y + origine). */
    render() {
        this.gridGroup = document.createElementNS(SVG_NS, 'g');
        this.gridGroup.classList.add('debug-grid');
        this.parentGroup.append(this.gridGroup);
    
        this._renderGridLines();
        this._renderAxes();
        this._renderOrigin();
    }

    /** Retire les éléments du DOM (nettoyage). */
    destroy() {
        this.gridGroup?.remove();
        this.gridGroup = null;
    }

    // --- Méthodes internes de construction ---


    _renderGridLines() {
        const { spacing, extent } = this;

        for (let x = -extent; x <= extent; x += spacing) {
            if (x === 0) continue;

            const line = this._createLine(x, -extent, x, extent, 'debug-grid-line-v');

            line.setAttribute('stroke', 'lightgray');
            line.setAttribute('stroke-width', '1');

            this.gridGroup.appendChild(line);
        }

        for (let y = -extent; y <= extent; y += spacing) {
            if (y === 0) continue;

            const line = this._createLine(-extent, y, extent, y, 'debug-grid-line-h');

            line.setAttribute('stroke', 'lightgray');
            line.setAttribute('stroke-width', '1');

            this.gridGroup.appendChild(line);
        }
    }

    _renderAxes() {
        const xLine = this._createLine(-this.extent, 0, this.extent, 0, 'debug-grid-axis-x');
        const yLine = this._createLine(0, -this.extent, 0, this.extent, 'debug-grid-axis-y');

        xLine.setAttribute('stroke', 'gray');
        xLine.setAttribute('stroke-width', '2');
        xLine.setAttribute('vector-effect', 'non-scaling-stroke');

        yLine.setAttribute('stroke', 'gray');
        yLine.setAttribute('stroke-width', '2');
        yLine.setAttribute('vector-effect', 'non-scaling-stroke');

        this.gridGroup.append(xLine, yLine);
    }

    _renderOrigin() {
        const xAxis = this._createLine(0, 0, 50, 0, 'debug-grid-origin-x');
        const yAxis = this._createLine(0, 0, 0, -50, 'debug-grid-origin-y');
        const originCircle = document.createElementNS(SVG_NS, 'circle');

        originCircle.setAttribute('cx', 0);
        originCircle.setAttribute('cy', 0);
        originCircle.setAttribute('r', 5);
        originCircle.setAttribute('fill', 'black');
        originCircle.setAttribute('vector-effect', 'non-scaling-stroke');

        xAxis.setAttribute('stroke', 'red');
        xAxis.setAttribute('stroke-width', '4');
        
        yAxis.setAttribute('stroke', 'green');
        yAxis.setAttribute('stroke-width', '4');
        
        this.gridGroup.append(xAxis, yAxis, originCircle);
    }

    _createLine(x1, y1, x2, y2, className) {
        const line = document.createElementNS(SVG_NS, 'line');

        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);

        line.setAttribute('vector-effect', 'non-scaling-stroke');
        line.classList.add(className);

        return line;
    }

}
