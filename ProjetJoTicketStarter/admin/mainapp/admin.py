from django.contrib import admin


from mainapp.models import Event, Stadium, Team, Ticket

admin.site.register(Event)
admin.site.register(Stadium)
admin.site.register(Team)
admin.site.register(Ticket)
