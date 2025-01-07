from django.shortcuts import render
from ..models import Event, Team, Stadium
from django.contrib.auth.decorators import login_required

@login_required
def eventsView(request):
    user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
    is_mobile = 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent
    
    if is_mobile:
        return render(request, 'mobile_events.html')
    
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