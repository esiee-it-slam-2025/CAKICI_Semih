import uuid
from django.db import models
from django.contrib.auth.models import User
from .event import Event
import qrcode
from io import BytesIO
from django.core.files.base import ContentFile


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
    # qr_code = models.ImageField(upload_to='qr_codes/', blank=True)

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


    def generate_qr_code(self):
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr_data = {
            'ticket_id': str(self.id),
            'event_id': str(self.event.id),
            'category': self.category,
            'user_id': str(self.user.id)
        }
        qr.add_data(str(qr_data))
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        filename = f'qr_code_{self.id}.png'
        self.qr_code.save(filename, ContentFile(buffer.getvalue()), save=False)
