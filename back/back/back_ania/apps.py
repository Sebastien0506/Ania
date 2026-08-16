from django.apps import AppConfig
import threading

class BackAniaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'back.back_ania'

class BackAniaConfig(AppConfig) :
    default_auto_field = "django.db.models.BigAutoField"
    name="back.back_ania"

    def ready(self):
        from back.core.bot import start_bot

        thread = threading.Thread(
            target=start_bot,
            daemon=True
        )

        thread.start()
