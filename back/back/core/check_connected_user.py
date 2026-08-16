import discord

from back.core.bot import bot


def connected_user(discord_id):
    discord_id = int(discord_id)

    for guild in bot.guilds:
        member = guild.get_member(discord_id)

        if member and member.voice:
            return member
        
    return  None