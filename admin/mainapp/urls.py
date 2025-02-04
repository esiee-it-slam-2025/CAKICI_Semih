from django.shortcuts import redirect
from django.urls import include, path

from django.urls import path
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import admin 
from .views.eventsView import eventsView 
from .views.api import buy_tickets, get_csrf_token, get_events, get_user_info, get_user_tickets, login_view, logout_view, register_user, signup_view, stadiums

urlpatterns = [
    
    path('', lambda request: redirect('login')), 
    path('login/', LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', LogoutView.as_view(next_page='/login/'), name='logout'),
    path('ticket/', LogoutView.as_view(next_page='/ticket/'), name='ticket'),
    path('events/', eventsView, name='events'),
    path('api/events/', get_events, name='get_events'), 
    path('api/events/', get_events, name='get_events'), 
    path('api/signup_view/', signup_view, name='signup_view'),
    path('api/csrf-token/', get_csrf_token, name='get_csrf_token'),  
    path('api/tickets/user/', get_user_tickets, name='get_user_tickets'), 
    path('api/tickets/buy/', buy_tickets, name='buy_tickets'), 
    path('api/register/', register_user, name='register_user'),
    path('api/logout/', logout_view, name='logout'),
    path('api/login/', login_view, name='login'),
    path('api/user/', get_user_info, name='get_user_info'),

    path("admin/", admin.site.urls), 
]