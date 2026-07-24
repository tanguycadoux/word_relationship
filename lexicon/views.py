from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import render, redirect
from django.views.generic import ListView, CreateView, UpdateView, DetailView

from .forms import WordForm, LanguageForm
from .models import Word, Language

from collections import defaultdict
import json


NODE_WIDTH = 100
NODE_HEIGHT = 50
HORIZONTAL_GAP = 50
VERTICAL_GAP = 50


class home(ListView):
    model = Word
    template_name = 'lexicon/home.html'
    context_object_name = 'words'

    def get_context_data(self, **kwargs):
        words = Word.objects.all()

        nodes = [{"id": w.id, "label": w.word, "language": {"id": w.language.id, "name": w.language.name}} for w in words]

        links = [{"source": parent.id, "target": w.id} for w in words for parent in w.parents.all()]
        context = super().get_context_data(**kwargs)
        context['graph_data'] = json.dumps({ "nodes": nodes, "links": links })
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

        add_node(word, 0, nodes, levels_by_id)
        nodes[word.id]['data']['is_center'] = True

        collect_ancestors(word, nodes, levels_by_id, edges)
        collect_descendants(word, nodes, levels_by_id, edges)

        compute_layout(nodes, levels_by_id)

        graph_data = {
            'nodes': list(nodes.values()),
            'edges': [
                {'from': str(s), 'to': str(t)}
                for s, t in edges
            ],
        }

        context['graph_data'] = json.dumps(graph_data, cls=DjangoJSONEncoder)
        return context

def compute_layout(nodes_by_id, levels_by_id):
    """
    Calcule x/y (coin haut-gauche) pour chaque nœud, groupé par level.
    """
    # Regrouper les ids par level
    ids_by_level = defaultdict(list)
    for node_id, level in levels_by_id.items():
        ids_by_level[level].append(node_id)

    y_step = NODE_HEIGHT + VERTICAL_GAP

    for level, ids in ids_by_level.items():
        ids.sort()
        col_width = len(ids) * NODE_HEIGHT + (len(ids) - 1) * VERTICAL_GAP
        start_y = -col_width / 2

        for i, node_id in enumerate(ids):
            x = level * (NODE_WIDTH + HORIZONTAL_GAP)
            y = start_y + i * y_step
            nodes_by_id[node_id]['x'] = x
            nodes_by_id[node_id]['y'] = y

def add_node(w, level, nodes, levels_by_id):
    nodes[w.id] = {
        'id': str(w.id),
        'width': NODE_WIDTH,
        'height': NODE_HEIGHT,
        'data': {
            'label': w.word,
        },
    }
    if w.id not in levels_by_id:
        levels_by_id[w.id] = level
    elif level < 0:
        levels_by_id[w.id] = min(levels_by_id[w.id], level)
    else:
        levels_by_id[w.id] = max(levels_by_id[w.id], level)

def collect_ancestors(word, nodes, levels_by_id, edges, level=0, visited=None):
    """Remonte récursivement tous les parents, sans limite de profondeur."""
    if visited is None:
        visited = set()
    if word.id in visited:
        return  # cycle détecté, on arrête cette branche
    visited.add(word.id)

    for parent in word.parents.all():
        add_node(parent, level - 1, nodes, levels_by_id)
        edges.add((parent.id, word.id))
        collect_ancestors(parent, nodes, levels_by_id, edges, level - 1, visited)

def collect_descendants(word, nodes, levels_by_id, edges, level=0, visited=None):
    """Descend récursivement tous les enfants, sans limite de profondeur."""
    if visited is None:
        visited = set()
    if word.id in visited:
        return
    visited.add(word.id)

    for child in word.children.all():
        add_node(child, level + 1, nodes, levels_by_id)
        edges.add((word.id, child.id))
        collect_descendants(child, nodes, levels_by_id, edges, level + 1, visited)
