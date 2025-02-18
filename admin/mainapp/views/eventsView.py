from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect
from django.contrib import messages
from ..models import Event, Team, Stadium

@login_required
@csrf_protect
def eventsView(request):
    user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
    is_mobile = 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent
    
    if is_mobile:
        return render(request, 'mobile_events.html')
    
    if request.method == 'POST':
        try:
            for key, value in request.POST.items():
                if key.startswith('team_home_'):
                    event_id = key.split('_')[-1]
                    
                    try:
                        event = Event.objects.get(id=event_id)
                        
                        team_home_id = request.POST.get(f'team_home_{event_id}')
                        team_away_id = request.POST.get(f'team_away_{event_id}')
                        stadium_id = request.POST.get(f'stadium_{event_id}')
                        new_date = request.POST.get(f'date_{event_id}')

                        
                        if team_home_id and team_home_id != '':
                            event.team_home_id = team_home_id
                        
                        if team_away_id and team_away_id != '':
                            event.team_away_id = team_away_id
                        
                        if stadium_id and stadium_id != '':
                            event.stadium_id = stadium_id

                        if new_date and new_date != '':
                            event.start = new_date    
                        
                        event.save()
                    
                    except Event.DoesNotExist:
                        messages.error(request, f"Événement {event_id} non trouvé.")
            
            messages.success(request, "Les événements ont été mis à jour avec succès.")
            
            return redirect('events')
        
        except Exception as e:
            messages.error(request, f"Une erreur s'est produite : {str(e)}")
    
    events = Event.objects.select_related('stadium', 'team_home', 'team_away').all()
    teams = Team.objects.all()
    stadiums = Stadium.objects.all()
    
    defined_events = [event for event in events if event.team_home and event.team_away and event.stadium]
    undefined_events = [event for event in events if not (event.team_home and event.team_away and event.stadium)]

    phases = ["Quart de finale", "Demi-finale", "Finale"]
    phase_events = {
        "Quart de finale": undefined_events[:4],
        "Demi-finale": undefined_events[4:6],
        "Finale": undefined_events[6:],
    }

    return render(request, 'events.html', {
        'defined_events': defined_events,
        'phase_events': phase_events,
        'teams': teams,
        'stadiums': stadiums,
    })