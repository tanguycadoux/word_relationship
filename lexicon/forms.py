from django import forms
from .models import Word, Language

class WordForm(forms.ModelForm):
    class Meta:
        model = Word
        fields = ['word', 'definition', 'language', 'parents']

class LanguageForm(forms.ModelForm):
    class Meta:
        model = Language
        fields = ['name']