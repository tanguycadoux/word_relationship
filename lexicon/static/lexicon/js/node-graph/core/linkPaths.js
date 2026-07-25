/** Ligne droite simple entre deux points. */
export function straightLinkPath({ x1, y1, x2, y2 }) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
}

/**
 * Courbe de Bézier en S, avec tangentes horizontales aux deux extrémités
 * (sortie/entrée perpendiculaires à un bord vertical de nœud).
 * @param {{x1,y1,x2,y2}} endpoints
 * @param {object} [options]
 * @param {number} [options.curvature=0.5] - 0 = angle vif, 1 = courbe large
 */
export function horizontalBezierLinkPath({ x1, y1, x2, y2 }, { curvature = 0.5 } = {}) {
    const dx = Math.abs(x2 - x1) * curvature;
    const c1x = x1 + dx;
    const c2x = x2 - dx;
    return `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`;
}