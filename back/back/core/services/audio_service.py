import discord
import asyncio

async def play_audio(channel, filepath):
    print("Lancement de play_audio", flush=True)
    # Si le bot n'est pas dans un salon, on le connecte
    if not channel.guild.voice_client:
        vc = await channel.connect()
    else:
        vc = channel.guild.voice_client

    # Vérifie si le bot lit déjà un audio
    print("Lecture du message", flush=True)

    if vc.is_playing():
        raise RuntimeError("Le bot est déjà en train de lire un audio")

    # Récupère la boucle asynchrone
    loop = asyncio.get_running_loop()

    # Crée un objet permettant d'attendre la fin de la lecture
    finished = loop.create_future()

    def after(error):
        def complete():
            if finished.done():
                return

            if error:
                finished.set_exception(error)
            else:
                finished.set_result(None)

        loop.call_soon_threadsafe(complete)

    # Lance la lecture
    vc.play(discord.FFmpegPCMAudio(filepath), after=after)

    # Attend la fin de la lecture
    await finished

