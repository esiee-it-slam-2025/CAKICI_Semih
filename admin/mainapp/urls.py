from django.shortcuts import redirect
from django.urls import include, path

from django.urls import path
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import admin 
from .views.eventsView import eventsView 
from .views.api import get_events, stadiums 

urlpatterns = [
    
    path('', lambda request: redirect('login')), 
    path('login/', LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', LogoutView.as_view(next_page='/login/'), name='logout'),
    path('events/', eventsView, name='events'),
    path('api/events/', get_events, name='get_events'), 

    path("admin/", admin.site.urls), 
]