import { ensureRelativePosition, markAsOverlay } from "../node-graph/index.js";

/**
 * WordGraphControls
 * ------------------
 * Overlay HTML avec un bouton "reset" : recentre sur le nœud central s'il
 * existe (zoom=1), sinon ajuste la vue pour montrer tous les nœuds
 * (fitToNodes). Spécifique au concept de "nœud central" des mots — n'a pas
 * sa place dans node-graph/core.
 */
export class WordGraphControls {
    /**
     * @param {HTMLElement} container - le même conteneur que celui passé au Graph
     * @param {Graph} graph
     * @param {string|null} centerNodeId - id du nœud central, ou null s'il n'existe pas
     */
    constructor(container, graph, centerNodeId) {
        this.container = container;
        this.graph = graph;
        this.centerNodeId = centerNodeId;
        this.el = null;
    }

    render() {
        ensureRelativePosition(this.container);

        this.el = document.createElement('div');
        markAsOverlay(this.el);
        this.el.style.position = 'absolute';
        this.el.style.top = '8px';
        this.el.style.right = '8px';
        this.el.style.zIndex = '10';
        this.el.style.padding = '4px';
        this.el.style.background = 'rgba(255, 255, 255, 65%)';
        this.el.style.border = '1px solid #ddd';
        this.el.style.borderRadius = '4px';
        this.el.style.backdropFilter = 'blur(8px)';
        this.el.style.fontFamily = 'sans-serif';

        this.el.appendChild(this._createButton('Reset', () => this._resetView()));

        this.container.appendChild(this.el);
    }

    destroy() {
        this.el?.remove();
        this.el = null;
    }

    _resetView() {
        if (this.centerNodeId) {
            this.graph.centerOnNode(this.centerNodeId, { zoom: 1 });
        } else {
            this.graph.fitToNodes();
        }
    }

    _createButton(label, onClick) {
        const button = document.createElement('button');
        button.textContent = label;
        button.type = 'button';
        button.style.padding = '4px 6px';
        button.style.background = 'oklch(95% 0.02 230)';
        button.style.border = '2px solid oklch(85% 0.05 230)';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.addEventListener('click', onClick);
        return button;
    }
}
