/**
 * S'assure qu'un élément a un positionnement CSS autre que 'static', sans
 * écraser un positionnement déjà défini par la page consommatrice.
 * Prérequis pour tout overlay HTML positionné en absolute par-dessus lui
 * (DebugControls, légendes, futurs panneaux...).
 */
export function ensureRelativePosition(el) {
    if (getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
    }
}

/**
 * Classe marqueur : identifie un élément comme overlay HTML (pas partie du
 * contenu du graphe). InteractionManager s'appuie dessus pour ignorer les
 * mousedown qui commencent sur un overlay (légende, boutons de contrôle...),
 * plutôt que de déclencher un pan/drag du viewport.
 */
export const OVERLAY_MARKER_CLASS = 'node-graph-overlay';

/** Marque un élément comme overlay, à appeler par tout module qui en crée un. */
export function markAsOverlay(el) {
    el.classList.add(OVERLAY_MARKER_CLASS);
}
