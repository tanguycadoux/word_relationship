from django.db import models


class Word(models.Model):
    word = models.CharField(max_length=255, unique=False)
    definition = models.TextField(blank=True, null=True)
    language = models.ForeignKey('Language', on_delete=models.SET_NULL, null=True)
    parents = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='children')

    def __str__(self):
        return self.word


class Language(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
