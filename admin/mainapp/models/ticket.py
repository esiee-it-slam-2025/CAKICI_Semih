import uuid
from django.db import models
from django.contrib.auth.models import User
from .event import Event


class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tickets')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    category = models.CharField(
        max_length=20,
        choices=[
            ('Silver', 'Silver'),
            ('Gold', 'Gold'),
            ('Platinium', 'Platinium'),
        ],
    )
    price = models.DecimalField(max_digits=6, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ticket {self.id} - {self.event} - {self.category}"

    def save(self, *args, **kwargs):
        category_prices = {
            'Silver': 100.00,
            'Gold': 200.00,
            'Platinium': 300.00,
        }
        self.price = category_prices.get(self.category, 0.00)
        super().save(*args, **kwargs)
