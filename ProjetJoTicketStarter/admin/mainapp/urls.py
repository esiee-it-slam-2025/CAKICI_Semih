from django.shortcuts import redirect
from django.urls import path

from django.urls import path
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import admin

from .views import api
from .views.eventsView import eventsView
from django.views.generic.base import RedirectView

from .views.eventsView import eventsView 



urlpatterns = [
    path("admin/", admin.site.urls), 
    path('events/', eventsView, name='events'),
    path('login/', LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', api.logout_view, name='logout'),

    
    path('ticket/', LogoutView.as_view(next_page='/ticket/'), name='ticket'),
    
    # Redirection pour login_required
    path('accounts/login/', RedirectView.as_view(url='/login/'), name='redirect_login'),
    
    # API endpoints
    path('api/events/', api.get_events, name='api_events'),
    path('api/stadiums/', api.stadiums, name='api_stadiums'),
    path('api/teams/', api.teams, name='api_teams'),
    path('api/csrf-token/', api.get_csrf_token, name='get_csrf_token'),
    path('api/tickets/buy/', api.buy_tickets, name='buy_tickets'),
    path('api/tickets/user/', api.get_user_tickets, name='get_user_tickets'),
    path('api/tickets/<uuid:ticket_id>/', api.get_ticket_details, name='get_ticket_details'),
    path('api/login/', api.login_view, name='api_login'),
    path('api/logout/', api.logout_view, name='api_logout'),
    path('api/register/', api.register_user, name='api_register'),
    path('api/user/', api.get_user_info, name='get_user_info'),
    path('api/signup/', api.signup_view, name='signup_view'),


    # Redirection de la page d'accueil vers events
    # path('', lambda request: redirect('login')), 
    path('', lambda request: redirect('events'), name='home'),
]