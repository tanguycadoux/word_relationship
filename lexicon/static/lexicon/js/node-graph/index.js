/**
 * Point d'entrée public de node-graph.
 *
 * Seul ce fichier doit être importé par les projets consommateurs
 * (ex: word-graph/WordGraph.js). Les autres fichiers de core/ sont des
 * détails d'implémentation et peuvent changer sans préavis, y compris leur
 * emplacement — seule la forme des exports ci-dessous est une API stable.
 *
 * Exception assumée : les outils de debug (DebugGrid, DebugControls) sont
 * importés directement depuis core/ par les scripts de démo/debug, jamais
 * réexportés ici — ce ne sont pas des dépendances d'un projet consommateur
 * en usage normal.
 */

export { Graph } from './Graph.js';
export { getNodeAnchor } from './core/nodeGeometry.js';
export { horizontalBezierLinkPath } from './core/linkPaths.js';
