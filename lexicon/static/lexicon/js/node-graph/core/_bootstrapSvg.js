/**
 * Crée le <svg> racine et le <g> interne (viewportGroup).
 * @param {HTMLElement} container
 * @returns {{ svg: SVGSVGElement, viewportGroup: SVGGElement }}
 */
export function bootstrapSvg(container) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    const viewportGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(viewportGroup);

    container.appendChild(svg);

    return { svg, viewportGroup };
}
