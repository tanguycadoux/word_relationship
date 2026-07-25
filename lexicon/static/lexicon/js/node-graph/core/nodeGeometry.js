export function getNodeAnchor(node, side) {
    switch (side) {
        case 'left': return { x: node.x, y: node.y + node.height / 2 };
        case 'right': return { x: node.x + node.width, y: node.y + node.height / 2 };
        case 'center': return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
        case _: throw new Error(`Anchor ${side} is not implemented yet.`);
        
    }
}
