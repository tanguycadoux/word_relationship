from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import render, redirect
from django.views.generic import ListView, CreateView, UpdateView, DetailView

from .forms import WordForm, LanguageForm
from .models import Word, Language

from collections import defaultdict, deque
import json


NODE_WIDTH = 100
NODE_HEIGHT = 50
HORIZONTAL_GAP = 50
VERTICAL_GAP = 50
COMPONENT_GAP = 100

class home(ListView):
    model = Word
    template_name = 'lexicon/home.html'
    context_object_name = 'words'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        words = list(Word.objects.all().prefetch_related('parents', 'children'))
        word_ids = {w.id for w in words}

        parents_of = defaultdict(set)
        children_of = defaultdict(set)
        adjacency = defaultdict(set)
        edges = set()

        for w in words:
            for parent in w.parents.all():
                parents_of[w.id].add(parent.id)
                children_of[parent.id].add(w.id)
                adjacency[w.id].add(parent.id)
                adjacency[parent.id].add(w.id)
                edges.add((parent.id, w.id))

        nodes = {}
        for w in words:
            add_node(w, nodes)

        components = find_components(word_ids, adjacency)

        y_offset = 0
        for component in components:
            levels = compute_component_levels(component, parents_of, children_of)
            height = compute_component_layout(component, levels, nodes, y_offset)
            y_offset += height + COMPONENT_GAP

        context['graph_data'] = json.dumps(
            build_graph_data(nodes, edges), cls=DjangoJSONEncoder
        )
        return context

def add_word(request):
    if request.method == 'POST':
        form = WordForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = WordForm()
    return render(request, 'lexicon/word_add.html', {'form': form})

def add_language(request):
    if request.method == 'POST':
        form = LanguageForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = LanguageForm()
    return render(request, 'lexicon/language_add.html', {'form': form})

class LanguageListView(ListView):
    model = Language
    template_name = 'lexicon/languages.html'
    context_object_name = 'languages'

class WordUpdateView(UpdateView):
    model = Word
    form_class = WordForm
    template_name = 'lexicon/word_update.html'
    success_url = '/'


class WordDetailView(DetailView):
    model = Word
    template_name = 'lexicon/word_detail.html'
    context_object_name = 'word'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        word = self.object

        nodes = {}
        levels_by_id = {}
        edges = set()

        add_node(word, nodes)
        levels_by_id[word.id] = 0
        nodes[word.id]['data']['is_center'] = True

        collect_ancestors(word, nodes, levels_by_id, edges)
        collect_descendants(word, nodes, levels_by_id, edges)

        compute_centered_layout(nodes, levels_by_id)

        context['graph_data'] = json.dumps(
            build_graph_data(nodes, edges), cls=DjangoJSONEncoder
        )
        return context

# ----------

def add_node(w, nodes):
    """Crée l'entrée de base d'un nœud (sans position, ajoutée plus tard)."""
    if w.id in nodes:
        return
    nodes[w.id] = {
        'id': str(w.id),
        'width': NODE_WIDTH,
        'height': NODE_HEIGHT,
        'data': {'label': w.word},
    }


def build_graph_data(nodes, edges):
    return {
        'nodes': list(nodes.values()),
        'edges': [{'from': str(s), 'to': str(t)} for s, t in edges],
    }

# ----------

def update_centered_level(node_id, level, levels_by_id):
    """Garde le niveau le plus extrême si le nœud est atteint par plusieurs chemins."""
    if node_id not in levels_by_id:
        levels_by_id[node_id] = level
    elif level < 0:
        levels_by_id[node_id] = min(levels_by_id[node_id], level)
    else:
        levels_by_id[node_id] = max(levels_by_id[node_id], level)


def collect_ancestors(word, nodes, levels_by_id, edges, level=0, visited=None):
    if visited is None:
        visited = set()
    if word.id in visited:
        return
    visited.add(word.id)

    for parent in word.parents.all():
        add_node(parent, nodes)
        update_centered_level(parent.id, level - 1, levels_by_id)
        edges.add((parent.id, word.id))
        collect_ancestors(parent, nodes, levels_by_id, edges, level - 1, visited)


def collect_descendants(word, nodes, levels_by_id, edges, level=0, visited=None):
    if visited is None:
        visited = set()
    if word.id in visited:
        return
    visited.add(word.id)

    for child in word.children.all():
        add_node(child, nodes)
        update_centered_level(child.id, level + 1, levels_by_id)
        edges.add((word.id, child.id))
        collect_descendants(child, nodes, levels_by_id, edges, level + 1, visited)


def compute_centered_layout(nodes_by_id, levels_by_id):
    """Positionne les nœuds en colonnes (x = level), centrées verticalement."""
    ids_by_level = defaultdict(list)
    for node_id, level in levels_by_id.items():
        ids_by_level[level].append(node_id)

    y_step = NODE_HEIGHT + VERTICAL_GAP

    for level, ids in ids_by_level.items():
        ids.sort()
        col_height = len(ids) * NODE_HEIGHT + (len(ids) - 1) * VERTICAL_GAP
        start_y = -col_height / 2

        for i, node_id in enumerate(ids):
            nodes_by_id[node_id]['x'] = level * (NODE_WIDTH + HORIZONTAL_GAP)
            nodes_by_id[node_id]['y'] = start_y + i * y_step

# ----------

def find_components(word_ids, adjacency):
    visited = set()
    components = []

    for start in word_ids:
        if start in visited:
            continue
        component = set()
        queue = deque([start])
        visited.add(start)
        while queue:
            node = queue.popleft()
            component.add(node)
            for neighbor in adjacency[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        components.append(component)

    return components


def compute_component_levels(component_ids, parents_of, children_of):
    """Tri topologique (Kahn) : level = plus long chemin depuis une racine."""
    in_degree = {
        node_id: len(parents_of[node_id] & component_ids)
        for node_id in component_ids
    }
    levels = {node_id: 0 for node_id in component_ids}

    queue = deque([n for n in component_ids if in_degree[n] == 0])
    processed = set()

    while queue:
        node = queue.popleft()
        processed.add(node)
        for child in children_of[node] & component_ids:
            levels[child] = max(levels[child], levels[node] + 1)
            in_degree[child] -= 1
            if in_degree[child] == 0 and child not in processed:
                queue.append(child)

    for node in component_ids - processed:
        levels[node] = 0  # nœuds pris dans un cycle

    return levels


def compute_component_layout(component_ids, levels, nodes, y_offset):
    """Positionne une composante, renvoie sa hauteur totale pour l'empilement."""
    ids_by_level = defaultdict(list)
    for node_id in component_ids:
        ids_by_level[levels[node_id]].append(node_id)

    y_step = NODE_HEIGHT + VERTICAL_GAP
    max_col_height = max(
        (len(ids) * NODE_HEIGHT + (len(ids) - 1) * VERTICAL_GAP
         for ids in ids_by_level.values()),
        default=0,
    )

    for level, ids in ids_by_level.items():
        ids.sort()
        col_height = len(ids) * NODE_HEIGHT + (len(ids) - 1) * VERTICAL_GAP
        start_y = y_offset + (max_col_height - col_height) / 2

        for i, node_id in enumerate(ids):
            nodes[node_id]['x'] = level * (NODE_WIDTH + HORIZONTAL_GAP)
            nodes[node_id]['y'] = start_y + i * y_step

    return max_col_height
