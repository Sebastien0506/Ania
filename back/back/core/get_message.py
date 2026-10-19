import discord
from back.core.bot import bot


async def get_channel_message(channel) :
    discord_channel = bot.get_channel(int(channel.channel_id))

    if discord_channel is None :
        return None
    
    messages = []

    async for message in discord_channel.history(limit=50):
        messages.append(
            {
                "id": message.id,
                "content" : message.content,
                "author": message.author.name
            }
        )
    return messages