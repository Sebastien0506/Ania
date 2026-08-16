import discord
from django.conf import settings
import os

intents = discord.Intents.default()
intents.members = True
intents.voice_states = True

bot = discord.Bot(intents=intents)


def start_bot():
    bot.run(settings.DISCORD_TOKEN)