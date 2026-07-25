// import { DebugGrid } from "{% static 'lexicon/js/node-graph/core/DebugGrid.js' %}";
// import { DebugControls } from "{% static 'lexicon/js/node-graph/core/DebugControls.js' %}";
import { Graph, getNodeAnchor, horizontalBezierLinkPath } from '../node-graph/index.js';

import { renderWordNode } from './renderWordNode.js';
import { getWordLinkEndpoints } from './wordLinkEndpoints.js';
import { WordGraphLegend } from './WordGraphLegend.js'
import { WordGraphControls } from './WordGraphControls.js'

/**
 * @param {HTMLElement} container
 * @param {{ nodes: Array, edges: Array }} graphData
 * @returns {Graph, WordGraphLegend, WordGraphControls}
 */
export function createWordGraph(container, graphData) {
    const nodes = graphData.nodes;
    const links = graphData.edges;

    const languages = [...new Set(nodes.map(n => n.data.language))];
    const languageHues = randomHuePerLanguage(languages);
    const languageColors = {};

    nodes.forEach(node => {
        const lang = node.data.language;
        if (lang && languageHues[lang] !== undefined) {
            const hue = languageHues[lang];
            const { fillColor, strokeColor } = defineFillAndStrokeColor(hue);
            node.data.fillColor = fillColor;
            node.data.strokeColor = strokeColor;
            languageColors[lang] = strokeColor;
        }
    });

    const graph = new Graph(container, {
        nodes: nodes, links: links,
        renderNode: renderWordNode,
        getLinkEndpoints: getWordLinkEndpoints,
        getLinkPath: horizontalBezierLinkPath,
    });

    const legend = new WordGraphLegend(container, languageColors);
    legend.render();
    
    const centerNode = nodes.find(n => n.data.is_center);
    const controls = new WordGraphControls(container, graph, centerNode?.id ?? null);
    controls.render();

    if (centerNode) {
        graph.centerOnNode(centerNode.id);
    }
    else {
        graph.fitToNodes();
    }
    
    // const grid = new DebugGrid(graph._viewportGroup, { spacing: 50, extent: 2000 });
    // const controls = new DebugControls(container, graph._viewport);

    // grid.render();
    // controls.render();

    return { graph, legend, controls };
}

function randomHuePerLanguage(languages) {
    const COLOROFFSET = 30;
    const hues = {};
    languages.forEach((lang, i) => {
        const hue = (i * 137.508 + COLOROFFSET) % 360;
        hues[lang] = hue;
    });
    return hues;
}

function defineFillAndStrokeColor(hue) {
    const fillColor = `oklch(97% 0.015 ${hue})`;
    const strokeColor = `oklch(65% 0.12 ${hue})`;
    return { fillColor, strokeColor };
}