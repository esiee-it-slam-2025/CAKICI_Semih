import json
from django.http import JsonResponse

from ..models.event import Event
from ..models.stadium import Stadium
from ..models.team import Team
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token

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

@csrf_exempt  # Since this endpoint will receive POST requests
def buy_ticket(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # Process ticket purchase logic here
            return JsonResponse({"message": "Ticket purchased successfully!"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Method not allowed"}, status=405)