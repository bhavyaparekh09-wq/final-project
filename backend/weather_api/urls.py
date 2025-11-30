# backend/weather_api/urls.py
from django.urls import path
from .views import get_weather

urlpatterns = [
    path("weather/", get_weather, name="get_weather"),
]
