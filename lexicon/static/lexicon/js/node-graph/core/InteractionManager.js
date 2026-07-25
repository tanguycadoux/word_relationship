import { OVERLAY_MARKER_CLASS } from './domUtils.js';

export class InteractionManager {
    /**
     * @param {HTMLElement} container
     * @param {Viewport} viewport
     * @param {GraphState} graphState
     */
    constructor(container, viewport, graphState) {
        this._container = container;
        this._viewport = viewport;
        this._graphState = graphState;

        // État du pan en cours
        this._isPanning = false;
        this._lastX = 0;
        this._lastY = 0;

        // État du drag d'un nœud
        this._draggingNodeId = null;
        this._dragOffsetX = 0;
        this._dragOffsetY = 0;

        this._onMouseDown = (event) => this._handleMouseDown(event);
        this._onMouseMove = (event) => this._handleMouseMove(event);
        this._onMouseUp = (event) => this._handleMouseUp(event);
        this._onWheel = (event) => this._handleWheel(event);

        this._bindEvents();

    }

    // --- Initialisation ---

    _bindEvents() {
        this._container.addEventListener('mousedown', this._onMouseDown);
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
        this._container.addEventListener('wheel', this._onWheel, { passive: false });
    }

    // --- Pan ---

    _handleMouseDown(event) {
        if (event.target.closest(`.${OVERLAY_MARKER_CLASS}`)) return;

        event.preventDefault();

        const nodeEl = event.target.closest('[data-node-id]');
        if (nodeEl) {
            this._startNodeDrag(nodeEl.dataset.nodeId, event);
        } else {
            this._startPan(event);
        }
    }
    _handleMouseMove(event) {
        if (!this._isPanning && !this._draggingNodeId) return;

        if (this._isPanning && this._draggingNodeId) {
            throw new Error("Cannot pan the viewport and drag a node at the same time.");
        }

        const dx = event.clientX - this._lastX;
        const dy = event.clientY - this._lastY;
        this._lastX = event.clientX;
        this._lastY = event.clientY;

        if (this._draggingNodeId) {
            const worldPos = this._viewport.screenToWorld(event.clientX, event.clientY);
            this._graphState.moveNode(
                this._draggingNodeId,
                worldPos.x - this._dragOffsetX,
                worldPos.y - this._dragOffsetY
            );
            document.body.style.cursor = 'grabbing';
            return;
        }


        if (this._isPanning) {
            this._viewport.panBy(dx, dy);
            document.body.style.cursor = 'move';
        }
    }
    _handleMouseUp(event) {
        this._isPanning = false;
        this._draggingNodeId = null;
        document.body.style.cursor = 'default';
    }

    _startPan(event) {
        this._isPanning = true;
        this._lastX = event.clientX;
        this._lastY = event.clientY;
    }
    _startNodeDrag(nodeId, event) {
        const node = this._graphState.getNode(nodeId);
        if (!node) return;

        this._draggingNodeId = nodeId;

        const worldPos = this._viewport.screenToWorld(event.clientX, event.clientY);
        this._dragOffsetX = worldPos.x - node.x;
        this._dragOffsetY = worldPos.y - node.y;
    }

    // --- Zoom ---

    _handleWheel(event) {
        event.preventDefault();
        const factor = event.deltaY < 0 ? 1.1 : 0.9;
        this._viewport.zoomAt(event.clientX, event.clientY, factor);
    }

    // --- Nettoyage ---

    destroy() {
        this._container.removeEventListener('mousedown', this._onMouseDown);
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
        this._container.removeEventListener('wheel', this._onWheel);
    }
}