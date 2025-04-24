import json
from django.http import JsonResponse

from mainapp.models.ticket import Ticket

from ..models.event import Event
from ..models.stadium import Stadium
from ..models.team import Team
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required

from django import forms
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout
import json


def stadiums(request):
    stadiums_list = Stadium.objects.all().values("id", "name", "location")
    return JsonResponse({"stadiums": list(stadiums_list)}, safe=False)

def teams(request):
    teams_list = Team.objects.all().values("id", "name", "nickname", "code")
    return JsonResponse({"teams": list(teams_list)}, safe=False)

def events(request):
    events_list = Event.objects.select_related('stadium', 'team_home', 'team_away').all()
    data = []
    for event in events_list:
        data.append({
            "id": event.id,
            "start": event.start,
            "stadium": {
                "id": event.stadium.id,
                "name": event.stadium.name,
                "location": event.stadium.location,
            },
            "team_home": {
                "id": event.team_home.id if event.team_home else None,
                "name": event.team_home.name if event.team_home else None,
                "code": event.team_home.code if event.team_home else None,
            },
            "team_away": {
                "id": event.team_away.id if event.team_away else None,
                "name": event.team_away.name if event.team_away else None,
                "code": event.team_away.code if event.team_away else None,
            },
            "score": event.score,
            "winner": {
                "id": event.winner.id if event.winner else None,
                "name": event.winner.name if event.winner else None,
            },
        })
    return JsonResponse({"events": data}, safe=False)


def get_events(request):
    events = Event.objects.select_related('team_home', 'team_away', 'stadium').order_by('start')

    data = [{
        'id': event.id,
        'start': event.start.isoformat(),
        'team_home': {
            'id': event.team_home.id, 
            'name': event.team_home.name
        } if event.team_home else None,
        'team_away': {
            'id': event.team_away.id, 
            'name': event.team_away.name
        } if event.team_away else None,
        'stadium': {
            'id': event.stadium.id, 
            'name': event.stadium.name
        } if event.stadium else None,
        'score': event.score,
        'winner': {
            'id': event.winner.id,
            'name': event.winner.name
        } if event.winner else None
    } for event in events]

    return JsonResponse({"events": data}, safe=False)


def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

@login_required
@csrf_exempt
def buy_tickets(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        event_id = data.get('event_id')
        tickets_info = data.get('tickets', [])

        if not event_id or not tickets_info:
            return JsonResponse({'error': 'Missing required data'}, status=400)

        event = Event.objects.get(id=event_id)
        created_tickets = []

        for ticket_info in tickets_info:
            category = ticket_info.get('category')
            quantity = ticket_info.get('quantity', 1)

            for _ in range(quantity):
                ticket = Ticket.objects.create(
                    event=event,
                    user=request.user,
                    category=category
                )
                created_tickets.append({
                    'id': str(ticket.id),
                    'category': ticket.category,
                    'price': float(ticket.price),
                    # 'qr_code_url': request.build_absolute_uri(ticket.qr_code.url) if ticket.qr_code else None
                })

        return JsonResponse({
            'message': 'Tickets purchased successfully',
            'tickets': created_tickets
        })

    except Event.DoesNotExist:
        return JsonResponse({'error': 'Event not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@login_required
def get_user_tickets(request):
    """Récupérer les tickets de l'utilisateur connecté"""
    tickets = Ticket.objects.filter(user=request.user).select_related('event', 'event__stadium', 'event__team_home', 'event__team_away')

    events_tickets = {}
    for ticket in tickets:
        event_id = str(ticket.event.id)
        if event_id not in events_tickets:
            events_tickets[event_id] = {
                'event': {
                    'id': str(ticket.event.id),
                    'start': ticket.event.start.isoformat(),
                    'team_home': {
                        'name': ticket.event.team_home.name if ticket.event.team_home else None
                    },
                    'team_away': {
                        'name': ticket.event.team_away.name if ticket.event.team_away else None
                    },
                    'stadium': {
                        'name': ticket.event.stadium.name if ticket.event.stadium else None
                    }
                },
                'tickets': []
            }
        
        events_tickets[event_id]['tickets'].append({
            'id': str(ticket.id), 
            'category': ticket.category,
            'price': float(ticket.price),
        })
    
    return JsonResponse({'events': list(events_tickets.values())})


def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user) 
            return redirect('events')
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})


class SignUpForm(forms.ModelForm):
    username = forms.CharField(
        label='Nom d\'utilisateur',
        max_length=150,
        help_text='150 caractères maximum'
    )
    email = forms.EmailField(
        label='Adresse électronique',
        max_length=254
    )
    first_name = forms.CharField(
        label='Prénom',
        max_length=30
    )
    last_name = forms.CharField(
        label='Nom',
        max_length=30
    )
    password1 = forms.CharField(
        label='Mot de passe',
        widget=forms.PasswordInput,
        help_text='Choisissez un mot de passe sécurisé'
    )
    password2 = forms.CharField(
        label='Confirmation du mot de passe',
        widget=forms.PasswordInput
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']

    def clean_username(self):
        username = self.cleaned_data['username']
        if User.objects.filter(username=username).exists():
            raise ValidationError("Ce nom d'utilisateur existe déjà.")
        return username

    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise ValidationError("Cette adresse email est déjà utilisée.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        
        if password1 and password2 and password1 != password2:
            raise ValidationError("Les mots de passe ne correspondent pas.")
        
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user
    


@csrf_exempt
def register_user(request):
    """Créer un utilisateur et l'ajouter à la base de données"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            email = data.get("email")
            password = data.get("password")

            if User.objects.filter(username=username).exists():
                return JsonResponse({"error": "Nom d'utilisateur déjà pris"}, status=400)
            if User.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email déjà utilisé"}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)

            login(request, user)

            return JsonResponse({"message": "Utilisateur créé avec succès"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"error": "Méthode non autorisée"}, status=405)


@csrf_exempt
def login_view(request):
    """Connexion d'un utilisateur"""
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"message": "Connexion réussie"}, status=200)
        return JsonResponse({"error": "Identifiants incorrects"}, status=401)

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)

@csrf_exempt
def logout_view(request):
    """Déconnexion de l'utilisateur"""
    logout(request)
    return redirect('login')

@login_required
def get_user_info(request):
    """ Renvoie les infos de l'utilisateur connecté """
    user = request.user
    return JsonResponse({
        "id": user.id,
        "username": user.username,
        "email": user.email
    }, status=200)

@login_required
def get_ticket_details(request, ticket_id):
    try:
        ticket = Ticket.objects.select_related(
            'event', 
            'event__stadium', 
            'event__team_home', 
            'event__team_away'
        ).get(id=ticket_id)
        
        return JsonResponse({
            'id': str(ticket.id),
            'category': ticket.category,
            'price': float(ticket.price),
            'event': {
                'name': f"{ticket.event.team_home.name} vs {ticket.event.team_away.name}",
                'start': ticket.event.start.isoformat(),
                'stadium': {
                    'name': ticket.event.stadium.name
                },
                'team_home': {
                    'name': ticket.event.team_home.name
                },
                'team_away': {
                    'name': ticket.event.team_away.name
                }
            }
        })
    except Ticket.DoesNotExist:
        return JsonResponse({'error': 'Ticket not found'}, status=404)