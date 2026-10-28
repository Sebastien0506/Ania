import discord
from django.conf import settings
from back.core.services.bot_join_vocal_channel import join
from channels.layers import get_channel_layer

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

@bot.event
async def on_message(message) :
    print(
        f"Message Discord reçu : {message.content}", flush=True
    )

    channel_layer = get_channel_layer()

    await channel_layer.group_send(
        f"channel_{message.channel.id}",
        {
            "type" : "new_message",
            "message" : {
                "author" : message.author.display_name,
                "content" : message.content,
                "discord_created_at": message.created_at.isoformat()
            }
        }
    )

    print("Message transmis à Django Channels", flush=True)