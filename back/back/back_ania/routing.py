from django.urls import re_path
from .consumers import ChannelConsumer

websocket_urlpatterns = [
    re_path(
        r"^ws/channel/(?P<channel_id>\d+)/$",
        ChannelConsumer.as_asgi()
    )
]