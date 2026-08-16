#Permet au bot de rejoindre le salon vocal
import discord

bot = discord.Bot()

@bot.slash_command(name="join", description="Fait rejoindre le salon vocal.")
async def join(interaction: discord.Interaction) -> None:
    #On récupère l'utilisateur
    user = interaction.user
    await interaction.response.defer()

#Si l'utilisateur n'est pas connecter au salon vocal on renvoi un message d'erreur
    if not user.voice:
        await interaction.followup.send(f"{user.name} is not connecter to a voice channel.", ephemeral=True)

        return
    #Si l'utilisateur est connecter au salon vocal on connecte le bot
    channel = user.voice.channel
    try :
        await channel.connect()

    except Exception as e :
        print(e)
    #On attend la connection
    await interaction.followup.send(f"Connected to { channel.name}") 
    

async def connect_bot_voice_channel(member):
    channel = member.voice.channel

    await channel.connect()
    return channel.name