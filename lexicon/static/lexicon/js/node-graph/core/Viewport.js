/**
 * Viewport
 * ---------
 * Gère la transformation "caméra" du tableau : translation (pan) et échelle (zoom).
 * Ne connaît ni les nœuds, ni les liens, ni GraphState : uniquement l'espace de
 * coordonnées et l'élément DOM sur lequel appliquer la transformation.
 *
 * Deux espaces de coordonnées à distinguer partout dans ce module :
 * - "écran" (screen) : pixels relatifs à la fenêtre (ex: event.clientX/Y)
 * - "monde"  (world)  : coordonnées internes au graphe, indépendantes du pan/zoom
 */
export class Viewport {
  /**
   * @param {SVGSVGElement} svgElement - le <svg> racine (dimensions fixes, sert de référence écran)
   * @param {SVGGElement} viewportGroup - le <g> interne sur lequel la transformation est appliquée
   * @param {object} [options]
   * @param {number} [options.x=0]
   * @param {number} [options.y=0]
   * @param {number} [options.zoom=1]
   * @param {number} [options.minZoom=0.1]
   * @param {number} [options.maxZoom=4]
   */
  constructor(svgElement, viewportGroup, options = {}) {
    if (!svgElement || !viewportGroup) {
      throw new Error('Viewport requires an svgElement and a viewportGroup');
    }

    this.svg = svgElement;
    this.group = viewportGroup;

    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.zoom = options.zoom ?? 1;

    this.minZoom = options.minZoom ?? 0.1;
    this.maxZoom = options.maxZoom ?? 4;

    this._applyTransform();
  }

  // --- Application de la transformation ---

  _applyTransform() {
    this.group.setAttribute(
      'transform',
      `translate(${this.x}, ${this.y}) scale(${this.zoom})`
    );
  }

  // --- Pan ---

  /** Déplace le viewport de (dx, dy) pixels écran. */
  panBy(dx, dy) {
    this.x += dx;
    this.y += dy;
    this._applyTransform();
  }

  // --- Zoom ---

  /**
   * Zoome (ou dézoome) en gardant fixe le point écran (screenX, screenY).
   * @param {number} factor - > 1 pour zoomer, < 1 pour dézoomer (ex: 1.1 / 0.9)
   */
  zoomAt(screenX, screenY, factor) {
    const worldBefore = this.screenToWorld(screenX, screenY);

    const newZoom = this._clamp(this.zoom * factor, this.minZoom, this.maxZoom);
    if (newZoom === this.zoom) return; // déjà à la limite min/max

    this.zoom = newZoom;

    // Recalcule x/y pour que worldBefore reste sous le curseur après le zoom
    const worldAfter = this.screenToWorld(screenX, screenY);
    this.x += (worldAfter.x - worldBefore.x) * this.zoom;
    this.y += (worldAfter.y - worldBefore.y) * this.zoom;

    this._applyTransform();
  }

  /**
   * Centre le viewport sur un point du "monde", optionnellement à un zoom donné.
   * Utilisé par exemple pour centrer le graphe sur le nœud de la page courante.
   */
  centerOn(worldX, worldY, { zoom } = {}) {
    const rect = this.svg.getBoundingClientRect();

    if (zoom !== undefined) {
      this.zoom = this._clamp(zoom, this.minZoom, this.maxZoom);
    }

    this.x = rect.width / 2 - worldX * this.zoom;
    this.y = rect.height / 2 - worldY * this.zoom;

    this._applyTransform();
  }

  /** Réinitialise le viewport (pan au centre, zoom à 1). */
  reset() {
    this.centerOn(0, 0);
    this.zoom = 1;
    this._applyTransform();
  }

  // --- Conversions de coordonnées ---

  /** Convertit des coordonnées écran (ex: event.clientX/Y) en coordonnées monde. */
  screenToWorld(screenX, screenY) {
    const rect = this.svg.getBoundingClientRect();
    const sx = screenX - rect.left;
    const sy = screenY - rect.top;
    return {
      x: (sx - this.x) / this.zoom,
      y: (sy - this.y) / this.zoom,
    };
  }

  /** Convertit des coordonnées monde en coordonnées écran. */
  worldToScreen(worldX, worldY) {
    const rect = this.svg.getBoundingClientRect();
    return {
      x: worldX * this.zoom + this.x + rect.left,
      y: worldY * this.zoom + this.y + rect.top,
    };
  }

  // --- Utilitaire ---

  _clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
}