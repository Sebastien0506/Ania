from back.core.bot import bot
from back.back_ania.models import Guild


def sync_guilds() :
    for discord_guild in bot.guilds :
        Guild.objects.update_or_create(
            guild_id=discord_guild.id,
            defaults={
                "name": discord_guild.name
            }
        )