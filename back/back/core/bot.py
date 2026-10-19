import discord
from django.conf import settings
from back.core.services.bot_join_vocal_channel import join

intents = discord.Intents.default()
intents.members = True
intents.voice_states = True

bot = discord.Bot(intents=intents)

bot.slash_command(
    name="join",
    description="Fait rejoindre le salon vocal."
)(join)


def start_bot():
    bot.run(settings.DISCORD_TOKEN)