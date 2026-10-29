import discord
from django.conf import settings

async def join(interaction: discord.Interaction) -> None:
    user = interaction.user

    await interaction.response.defer(ephemeral=True)

    if not user.voice:
        await interaction.followup.send(
            f"{user.name} n'est pas connecté à un salon vocal."
        )
        return

    channel = user.voice.channel

    try:
        await channel.connect()

        await interaction.followup.send(
            f"Connecté au salon {channel.name}"
        )

    except Exception as e:
        await interaction.followup.send(
            f"Erreur de connexion : {e}"
        )


async def connect_bot_voice_channel(member):
    if not member.voice:
        return None

    channel = member.voice.channel

    await channel.connect()

    return channel.name

async def disconnect_bot_voice(bot, discord_id) :

    #On récupère la guild
    guild = bot.get_guild(settings.BOT_GUILD_ID)

    #On vérifie la guild
    if guild is None :
        return False
    
    #On récupère le membre
    member = guild.get_member(int(discord_id))

    if member is None :
        return False
    
    if member.voice is None :
        return False
    
    voice_client = guild.voice_client

    if voice_client is None or not voice_client.is_connected() :
        return False
    
    await voice_client.disconnect()

    return True
