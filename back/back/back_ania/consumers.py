import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from http.cookies import SimpleCookie

from back.core.bot import bot


@database_sync_to_async
def get_user(discord_token):
    try:
        token = AccessToken(discord_token)
        return get_user_model().objects.filter(
            id=token["user_id"]
        ).first()
    except (TokenError, KeyError):
        return None


class ChannelConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.channel_id = self.scope["url_route"]["kwargs"]["channel_id"]
        self.group_name = f"channel_{self.channel_id}"

        # Récupération du cookie JWT
        cookies = SimpleCookie()
        cookies.load(dict(self.scope["headers"]).get(b"cookie", b"").decode())
        access_token = cookies.get("access_token")

        if not access_token:
            await self.close()
            return

        # Identification de l'utilisateur
        user = await get_user(access_token.value)

        if not user or not user.discord_id:
            await self.close()
            return

        # Vérification des permissions Discord
        for guild in bot.guilds:
            channel = guild.get_channel(int(self.channel_id))

            if channel:
                member = guild.get_member(int(user.discord_id))

                if member and channel.permissions_for(member).view_channel:
                    await self.channel_layer.group_add(
                        self.group_name,
                        self.channel_name
                    )

                    await self.accept()
                    return

        # Accès refusé
        await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def new_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))