from django.urls import path
from . import views

urlpatterns = [
    path('', views.home.as_view(), name='home'),

    path('word_add/', views.add_word, name='add_word'),
    path('word_update/<int:pk>/', views.WordUpdateView.as_view(), name='update_word'),
    path('word_detail/<int:pk>/', views.WordDetailView.as_view(), name='word_detail'),

    path('languages/', views.LanguageListView.as_view(), name='languages'),
    path('add_language/', views.add_language, name='add_language'),
]