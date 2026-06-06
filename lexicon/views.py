from django.shortcuts import render, redirect
from django.views.generic import ListView, CreateView, UpdateView, DetailView

from .forms import WordForm, LanguageForm
from .models import Word, Language

import json


class home(ListView):
    model = Word
    template_name = 'lexicon/home.html'
    context_object_name = 'words'

    def get_context_data(self, **kwargs):
        words = Word.objects.all()

        nodes = [{"id": w.id, "label": w.word, "language": {"id": w.language.id, "name": w.language.name}} for w in words]

        links = [{"source": w.parent.id, "target": w.id} for w in words if w.parent]
        
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