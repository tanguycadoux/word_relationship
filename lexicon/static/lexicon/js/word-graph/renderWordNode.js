export function renderWordNode(node, el) {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', node.width);
  rect.setAttribute('height', node.height);
  rect.setAttribute('fill', node.data.fillColor ?? '#eee');
  rect.setAttribute('stroke', node.data.strokeColor ?? node.data.color ?? '#888');
  rect.setAttribute('stroke-width', '2');
  rect.setAttribute('rx', '5');
  el.appendChild(rect);

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', node.width / 2);
  text.setAttribute('y', node.height / 2);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'middle');
  text.textContent = node.data.label ?? node.id;
  el.appendChild(text);
}
