import { Viewport } from './core/Viewport.js';
import { GraphState } from './core/GraphState.js';
import { Renderer } from './core/Renderer.js';
import { InteractionManager } from './core/InteractionManager.js'; // à venir

const SVG_NS = 'http://www.w3.org/2000/svg';

export class Graph {
    /**
     * @param {HTMLElement} container
     * @param {object} [options]
     * @param {Array<Node>} [options.nodes] - état initial
     * @param {Array<Link>} [options.links] - état initial
     * @param {(node: Node, el: SVGGElement) => void} [options.renderNode] - personnalisation par l'appli
     * @param {(node: Node) => void} [options.onNodeMove] - callback appli, pour plus tard
     */
    constructor(container, options = {}) {
        this._container = container;
        this._svg = null;
        this._viewportGroup = null;
        this._viewport = null;
        this._graphState = null;
        this._renderer = null;

        this._createSvg(container);
        this._initModules(options);
    }

    // --- Construction interne (assemblage des modules) ---

    _createSvg(container) {
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');

        const viewportGroup = document.createElementNS(SVG_NS, 'g');
        svg.appendChild(viewportGroup);

        container.appendChild(svg);

        this._svg = svg;
        this._viewportGroup = viewportGroup;
    }
    _initModules(options) {
        this._viewport = new Viewport(this._svg, this._viewportGroup);
        this._graphState = new GraphState({ nodes: options.nodes, links: options.links });
        this._renderer = new Renderer(this._viewportGroup, this._graphState, {
            renderNode: options.renderNode,
            getLinkEndpoints: options.getLinkEndpoints,
            getLinkPath: options.getLinkPath,
        });
        this._interactionManager = new InteractionManager(this._container, this._viewport, this._graphState);
    }

    // --- API publique : données ---

    addNode(node) { this._graphState.addNode(node); }
    removeNode(id) { this._graphState.removeNode(id); }
    addLink(link) { this._graphState.addLink(link); }
    removeLink(link) { this._graphState.removeLink(link); }

    // --- API publique : viewport ---

    centerOnNode(nodeId, options) {
        const node = this._graphState.getNode(nodeId);
        if (!node) {
            console.warn(`Cannot center: node "${nodeId}" not found.`);
            return;
        }
        this.centerOnCoordinates(node.x + node.width / 2, node.y + node.height / 2, options);
    }
    fitToNodes({ padding = 0.9 } = {}) {
        const bounds = this._graphState.getBounds();
        if (!bounds) return;

        const boundsWidth = bounds.maxX - bounds.minX;
        const boundsHeight = bounds.maxY - bounds.minY;

        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;

        const rect = this._svg.getBoundingClientRect();

        let zoom;
        if (boundsWidth === 0 && boundsHeight === 0) {
            zoom = 1;
        }
        else {
            const zoomX = rect.width / boundsWidth;
            const zoomY = rect.height / boundsHeight;
            zoom = Math.min(zoomX, zoomY) * padding;
        }

        this.centerOnCoordinates(centerX, centerY, { zoom });
    }
    centerOnCoordinates(x, y, options) { this._viewport.centerOn(x, y, options); }
    resetView() { this._viewport.reset(); }
    setZoom(zoom) { this._viewport.setZoom(zoom); }

    // --- Nettoyage ---

    /** Désabonne tout, détruit Renderer/Viewport, retire le SVG du DOM. */
    destroy() {
        this._renderer.destroy();
        this._interactionManager.destroy();

        this._svg.remove();

        this._svg = null;
        this._viewportGroup = null;
        this._viewport = null;
        this._graphState = null;
        this._renderer = null;
        this._interactionManager = null;
    }
}