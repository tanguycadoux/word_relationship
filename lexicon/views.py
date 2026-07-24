from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import render, redirect
from django.views.generic import ListView, CreateView, UpdateView, DetailView

from .forms import WordForm, LanguageForm
from .models import Word, Language

from collections import defaultdict
import json


NODE_WIDTH = 100
NODE_HEIGHT = 50
HORIZONTAL_GAP = 50   # espace entre deux nœuds côte à côte
VERTICAL_GAP = 80     # espace entre deux niveaux


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

        def add_node(w, level=0):
            nodes[w.id] = {
                'id': str(w.id),
                'width': NODE_WIDTH,
                'height': NODE_HEIGHT,
                'data': {
                    'label': w.word,
                    'is_center': w.id == word.id,
                },
            }
            levels_by_id[w.id] = level

        def add_edge(parent, child):
            edges.add((str(parent.id), str(child.id)))

        # Le mot central
        add_node(word, level=0)

        # --- Ancêtres : parents + grands-parents ---
        parents = list(word.parents.all())
        for parent in parents:
            add_node(parent, level=-1)
            add_edge(parent, word)

            grandparents = parent.parents.all()
            for gp in grandparents:
                add_node(gp, level=-2)
                add_edge(gp, parent)

        # --- Descendants : enfants + petits-enfants ---
        children = list(word.children.all())
        for child in children:
            add_node(child, level=1)
            add_edge(word, child)

            grandchildren = child.children.all()
            for gc in grandchildren:
                add_node(gc, level=2)
                add_edge(child, gc)

        compute_layout(nodes, levels_by_id)

        graph_data = {
            'nodes': list(nodes.values()),
            'edges': [{'source': s, 'target': t} for s, t in edges],
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
        ids.sort()  # ordre stable, tu peux trier autrement (alpha, etc.)
        col_width = len(ids) * NODE_HEIGHT + (len(ids) - 1) * VERTICAL_GAP
        start_y = -col_width / 2

        for i, node_id in enumerate(ids):
            x = level * (NODE_WIDTH + HORIZONTAL_GAP)
            y = start_y + i * y_step
            nodes_by_id[node_id]['x'] = x
            nodes_by_id[node_id]['y'] = y
