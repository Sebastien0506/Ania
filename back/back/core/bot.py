import discord
from django.conf import settings
from back.core.services.bot_join_vocal_channel import join
from channels.layers import get_channel_layer
import random
import asyncio
from back.core.services.voice_message import generate_audio
import os
import json
from pathlib import Path

intents = discord.Intents.default()
intents.members = True
intents.voice_states = True

bot = discord.Bot(intents=intents)



bot.slash_command(
    name="join",
    description="Fait rejoindre le salon vocal."
)(join)

user_ids = {
    int(os.getenv("STEPH_ID")): "STEPH",
    int(os.getenv("NEME_ID")): "NEME",
    int(os.getenv("MOI_ID")): "MOI",
    int(os.getenv("GAB_ID")): "GAB",
    int(os.getenv("SEBOU_ID")): "SEBOU",
    int(os.getenv("MARTIAL_ID")): "MARTIAL",
    int(os.getenv("EPHREM_ID")): "EPHREM",
    int(os.getenv("RENX_ID")): "RENX",
    int(os.getenv("DRAKER_ID")): "DRAKER",
    int(os.getenv("SOPHIIE62_ID")): "SOPHIIE62",
    int(os.getenv("SUCHI_ID")): "SUCHI",
    int(os.getenv("ALBE974_ID")): "ALBE974",
    int(os.getenv("TSUKIYO_ID")): "TSUKIYO"
}


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

@bot.event
async def on_voice_state_update(member, before, after) :

    print(f"Utilisateur détecté : {member.name} ({member.id})", flush=True)

    with open(Path(__file__).resolve().parent / "phrases.json", "r", encoding="utf-8") as file:
        phrases = json.load(file)


    #On vérifie que l'utilisateur vient de changer de salon
    if before.channel == after.channel :
        return
    
    #Vérifie qu'il rejoint un salon vocal
    if after.channel is None :
        return
    
    #Récupère la connexion vocal d'ania
    voice_client = member.guild.voice_client

    if voice_client is None or not voice_client.is_connected() :
        return
    
    if after.channel.id != voice_client.channel.id :
        return
    
    #Récupère le nom associé à l'identifiant discord
    user_name = user_ids.get(member.id)

    if user_name is None :
        return 
    
    #On récupère les phrases de l'utilisateur
    user_phrases = phrases.get(user_name)

    if not user_phrases :
        return
    
    #On choisi une phrase aléatoire
    user_phrase = random.choice(user_phrases)

    print(f"Ania doit dire : {user_phrase}")

    #On génère le fichier audio
    filepath = await asyncio.to_thread(generate_audio, user_phrase)

    #Attendre si ania parle deja 
    while voice_client.is_playing() or voice_client.is_paused() :
        await asyncio.sleep(0.2)

    #Vérifier qu'Ania est toujours connectée
    if not voice_client.is_connected() :
        os.remove(filepath)
        return
    
    print(f"Lecture audio : connected={voice_client.is_connected()}",
          "Avant : ", voice_client.is_playing(), flush=True)
    #Lire la phrase
    voice_client.play(
        discord.FFmpegPCMAudio(filepath),
        after=lambda error: os.remove(filepath)
    )

    print("Après :", voice_client.is_playing(), flush=True)
