import { linkKey } from './linkKey.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export class Renderer {
    /**
     * @param {SVGGElement} viewportGroup - le <g> du Viewport, où tout est dessiné
     * @param {GraphState} graphState
     * @param {object} [options]
     * @param {(node: Node, el: SVGGElement) => void} [options.renderNode] - personnalisation par l'appli
     */
    constructor(viewportGroup, graphState, options = {}) {
        this._options = options;
        this._graphState = graphState;
        this._viewportGroup = viewportGroup;

        this._nodesGroup = null;
        this._linksGroup = null;

        this._nodeElements = new Map();
        this._linkElements = new Map();

        this._init();
    }

    // --- Initialisation ---

    /** Crée les groupes internes (liens en dessous, nœuds au-dessus) et fait le premier rendu. */
    _init() {
        this._linksGroup = document.createElementNS(SVG_NS, 'g');
        this._linksGroup.classList.add('node-graph-links-layer');

        this._nodesGroup = document.createElementNS(SVG_NS, 'g');
        this._nodesGroup.classList.add('node-graph-nodes-layer');

        this._viewportGroup.append(this._linksGroup, this._nodesGroup);

        this._renderInitialState();
        this._bindGraphEvents();
    }

    /** Rendu initial complet, pour peupler l'affichage à partir de l'état déjà présent dans GraphState. */
    _renderInitialState() {
        for (const node of this._graphState.getAllNodes()) {
            this._createNodeElement(node);
        }

        for (const link of this._graphState.getAllLinks()) {
            this._createLinkElement(link);
        }
    }

    // --- Abonnement aux événements de GraphState ---

    _bindGraphEvents() {
        this._onNodeAdded = (e) => this._handleNodeAdded(e);
        this._onNodeRemoved = (e) => this._handleNodeRemoved(e);
        this._onLinkAdded = (e) => this._handleLinkAdded(e);
        this._onLinkRemoved = (e) => this._handleLinkRemoved(e);

        this._graphState.addEventListener('nodeAdded', this._onNodeAdded);
        this._graphState.addEventListener('nodeRemoved', this._onNodeRemoved);
        this._graphState.addEventListener('linkAdded', this._onLinkAdded);
        this._graphState.addEventListener('linkRemoved', this._onLinkRemoved);
    }

    _handleNodeAdded(event) { this._createNodeElement(event.detail); }
    _handleNodeRemoved(event) { this._removeNodeElement(event.detail.id); }
    _handleNodeChanged(event) { } // pour plus tard : déplacement/redimensionnement

    _handleLinkAdded(event) { this._createLinkElement(event.detail); }
    _handleLinkRemoved(event) { this._removeLinkElement(event.detail); }

    // --- Création/suppression des éléments DOM : nœuds ---

    _createNodeElement(node) {
        const el = document.createElementNS(SVG_NS, 'g');
        el.id = `node-${node.id}`;
        el.classList.add('node-graph-node');
        el.setAttribute('transform', `translate(${node.x}, ${node.y})`);

        if (this._options.renderNode) {
            this._options.renderNode(node, el);
        } else {
            this._renderDefaultNode(node, el);
        }

        this._nodesGroup.append(el);
        this._nodeElements.set(node.id, el);
    }
    _renderDefaultNode(node, el) {
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('width', node.width);
        rect.setAttribute('height', node.height);
        rect.setAttribute('fill', '#ccc');
        rect.setAttribute('stroke', '#888');
        el.appendChild(rect);
    }
    _removeNodeElement(nodeId) {
        this._nodeElements.get(nodeId)?.remove();
        this._nodeElements.delete(nodeId);
    }

    // --- Création/suppression des éléments DOM : liens ---

    _createLinkElement(link) {
        const sourceNode = this._graphState.getNode(link.from);
        const targetNode = this._graphState.getNode(link.to);
        if (!sourceNode || !targetNode) {
            console.warn(`Cannot create link element: source or target node not found.`);
            return;
        }

        const el = document.createElementNS(SVG_NS, 'line');
        el.setAttribute('x1', sourceNode.x);
        el.setAttribute('y1', sourceNode.y);
        el.setAttribute('x2', targetNode.x);
        el.setAttribute('y2', targetNode.y);
        el.setAttribute('stroke', '#888');
        el.setAttribute('stroke-width', 2);

        this._linksGroup.append(el);
        this._linkElements.set(linkKey(link.from, link.to), el);
    }
    _removeLinkElement(link) {
        const key = linkKey(link.from, link.to);
        this._linkElements.get(key)?.remove();
        this._linkElements.delete(key);
    }

    // --- Nettoyage ---

    /** Désabonne les listeners de GraphState et retire les groupes du DOM. */
    destroy() {
        this._graphState.removeEventListener('nodeAdded', this._onNodeAdded);
        this._graphState.removeEventListener('nodeRemoved', this._onNodeRemoved);
        this._graphState.removeEventListener('linkAdded', this._onLinkAdded);
        this._graphState.removeEventListener('linkRemoved', this._onLinkRemoved);
    }
}