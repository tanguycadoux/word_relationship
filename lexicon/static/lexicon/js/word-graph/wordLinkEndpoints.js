import { getNodeAnchor } from '../node-graph/core/nodeGeometry.js';

export function getWordLinkEndpoints(link, fromNode, toNode) {
  const start = getNodeAnchor(fromNode, 'right');
  const end = getNodeAnchor(toNode, 'left');
  return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
}
