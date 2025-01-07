from django.http import JsonResponse

from ..models.event import Event
from ..models.stadium import Stadium
from ..models.team import Team


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
