// import { DebugGrid } from "{% static 'lexicon/js/node-graph/core/DebugGrid.js' %}";
// import { DebugControls } from "{% static 'lexicon/js/node-graph/core/DebugControls.js' %}";
import { Graph } from '../node-graph/Graph.js';

/**
 * @param {HTMLElement} container
 * @param {{ nodes: Array, edges: Array }} graphData
 * @returns {Graph}
 */
export function createWordGraph(container, graphData) {
    const graph = new Graph(container, { nodes: graphData.nodes, links: graphData.edges });

    const centerNode = graphData.nodes.find(n => n.data.is_center);
    if (centerNode) {
        graph.centerOnNode(centerNode.id);
    }

    // const grid = new DebugGrid(graph._viewportGroup, { spacing: 50, extent: 2000 });
    // const controls = new DebugControls(container, graph._viewport);

    // grid.render();
    // controls.render();

    return graph;
}