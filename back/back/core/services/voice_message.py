from gtts import gTTS
from tempfile import NamedTemporaryFile
import os
from back.core.services.audio_service import play_audio
import asyncio
import discord

def generate_audio(message) :
    with NamedTemporaryFile(suffix=".mp3", delete=False) as file:
        filepath = file.name

        try :
            tts = gTTS(text=message, lang="fr")
            tts.save(filepath)
            return filepath
        
        except Exception :
            os.remove(filepath)
            raise

async def voice_message(bot, user_id, channel_id, message) :
    #On récupère les données
    user_id = int(user_id)
    channel_id= int(channel_id)

    #On récupère le salon textuel Discord
    channel = bot.get_channel(channel_id)

    if channel is None or not isinstance(channel, discord.TextChannel) :
        raise ValueError("Salon textuel introuvable.")
    
    #On publie le message dans le salon textuel
    await channel.send(
        message,
        allowed_mentions=discord.AllowedMentions.none()
    )

    for guild in bot.guilds :
        member = guild.get_member(user_id)

        if member and member.voice and member.voice.channel :
            voice_channel = member.voice.channel

            filepath = await asyncio.to_thread(generate_audio, message)

            try :
                await play_audio(voice_channel, filepath)

            finally :
                os.remove(filepath)

            return
    