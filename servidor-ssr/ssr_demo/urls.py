"""
URL configuration for ssr_demo project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include  # include() nos deja "delegar" rutas a otra app

urlpatterns = [
    path('admin/', admin.site.urls),

    # Cualquier ruta que empiece vacía ('') se delega al urls.py de la app "catalogo".
    # Así, /catalogo/ termina resuelta por catalogo/urls.py
    path('', include('catalogo.urls')),
]