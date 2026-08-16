from back.core.bot import bot

#On récupère le role de l'utilisateur
def get_user_roles(discord_id) :
    discord_id = int(discord_id)

    for guild in bot.guilds:
        member = guild.get_member(discord_id)

        if member:
            roles = []

            for role in member.roles:
                roles.append(
                    {
                        "id": role.id,
                        "name": role.name
                    }
                )
            return roles
    return None