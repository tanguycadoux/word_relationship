from django import forms
from .models import Word, Language

class WordForm(forms.ModelForm):
    class Meta:
        model = Word
        fields = ['word', 'definition', 'language', 'parents']

    class Media:
        css = {
            'all': ('https://cdn.jsdelivr.net/npm/select2@4.1.0/dist/css/select2.min.css',)
        }
        js = (
            'https://code.jquery.com/jquery-3.7.1.min.js',
            'https://cdn.jsdelivr.net/npm/select2@4.1.0/dist/js/select2.min.js',
            'lexicon/js/wordForm.js',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        qs = Word.objects.order_by('word')
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        self.fields['parents'].queryset = qs


class LanguageForm(forms.ModelForm):
    class Meta:
        model = Language
        fields = ['name']