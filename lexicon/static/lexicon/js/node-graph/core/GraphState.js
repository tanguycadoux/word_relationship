import { linkKey } from './linkKey.js';

/**
 * GraphState
 * -------------
 * 
 */
export class GraphState extends EventTarget {
    /**
     * @param {nodes} nodes
     * @param {links} links
     */
    constructor({ nodes = [], links = [] }) {
        super();

        this.nodes = new Map();
        this.links = new Map();

        nodes.forEach(node => this.addNode(node));
        links.forEach(link => this.addLink(link));
    }

    /**
     * @typedef {object} Node
     * @property {string} id
     * @property {number} x
     * @property {number} y
     * @property {number} width
     * @property {number} height
     * @property {object} data
     */

    /** @param {Node} node */
    addNode({ id, x, y, width, height, data = {} }) {
        const node = { id, x, y, width, height, data };

        if (this.nodes.has(id)) {
            console.warn(`Node with id "${id}" already exists. It will be replaced.`);
        }
        this.nodes.set(id, node);
        this._notifyChange('nodeAdded', { detail: node });
    }
    /** @param {string} id */
    removeNode(id) {
        const node = this.nodes.get(id);
        if (!node) return;

        const relatedLinks = this.getAllLinks().filter(
            (link) => link.from === id || link.to === id
        );
        for (const link of relatedLinks) {
            this.removeLink(link);
        }

        this.nodes.delete(id);
        this._notifyChange('nodeRemoved', { detail: node });
    }
    /**
     * @param {string} id
     * @returns {Node | undefined} */
    getNode(id) {
        return this.nodes.get(id);
    }
    getAllNodes() {
        return Array.from(this.nodes.values());
    }

    moveNode(id, x, y) {
        const node = this.nodes.get(id);
        if (!node) return;

        node.x = x;
        node.y = y;

        this._notifyChange('nodeChanged', { detail: node });
    }

    /**
     * @typedef {object} Link
     * @property {string} from - Source node id
     * @property {string} to - Target node id
     */

    /** @param {Link} link */
    addLink({ from, to }) {
        const key = linkKey(from, to);
        const link = { from, to };

        if (this.links.has(key)) {
            console.warn(`Link "${key}" already exists. It will be replaced.`);
        }

        this.links.set(key, link);
        this._notifyChange('linkAdded', { detail: link });
    }
    removeLink({ from, to }) {
        const key = linkKey(from, to);
        const link = this.links.get(key);

        if (!link) return;

        this.links.delete(key);
        this._notifyChange('linkRemoved', { detail: link });
    }
    getAllLinks() {
        return Array.from(this.links.values());
    }

    getBounds() {
        const nodes = this.getAllNodes();
        if (nodes.length === 0) return null;

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const node of nodes) {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x + node.width);
            maxY = Math.max(maxY, node.y + node.height);
        }

        return { minX, minY, maxX, maxY };
    }

    // Émet un événement à chaque changement, pour que Renderer sache se mettre à jour
    _notifyChange(type, payload) {
        this.dispatchEvent(new CustomEvent(type, payload));
    }
}