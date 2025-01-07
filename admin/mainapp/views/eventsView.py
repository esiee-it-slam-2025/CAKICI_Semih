from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from ..models import Event, Team, Stadium

from django.contrib import messages

@login_required
def eventsView(request):
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

    if request.method == "POST":
        for event in events:
            team_home_id = request.POST.get(f"team_home_{event.id}")
            team_away_id = request.POST.get(f"team_away_{event.id}")
            stadium_id = request.POST.get(f"stadium_{event.id}")

            # Mettre à jour uniquement si une valeur est fournie
            event.team_home_id = team_home_id if team_home_id else None
            event.team_away_id = team_away_id if team_away_id else None
            event.stadium_id = stadium_id if stadium_id else None
            event.save()

        messages.success(request, "Les événements ont été mis à jour avec succès.")

    return render(request, 'events.html', {
        'defined_events': defined_events,
        'phase_events': phase_events,
        'teams': teams,
        'stadiums': stadiums,
    })
