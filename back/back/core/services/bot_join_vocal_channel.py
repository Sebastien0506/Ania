import discord


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