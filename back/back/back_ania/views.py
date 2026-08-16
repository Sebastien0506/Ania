import time
from dotenv import load_dotenv
from django.shortcuts import render, redirect
import os
import discord
import urllib.parse
from django.conf import settings
import requests
from .models import User, Guild, GuildRolePermission, Channel, Message, DiscordMessage
from django.http import JsonResponse
from rest_framework.response import Response 
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from back.back_ania.serializer import MessageSerializer, ChannelSerializer, DiscordMessageSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import AuthenticationFailed, TokenError, InvalidToken
from rest_framework.permissions import IsAuthenticated
from back.back_ania.authentication import CookieJWTAuthentication
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from back.core.check_connected_user import connected_user
from back.core.services.bot_join_vocal_channel import connect_bot_voice_channel
import asyncio
from back.core.bot import bot
from back.core.services.check_user_roles import get_user_roles
from back.core.sync_guilds import sync_guilds
load_dotenv()
# Create your views here.
CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET")
REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI")

def discord_login(request) :
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": "identify email guilds",
    }

    url = "http://discord.com/api/oauth2/authorize?" + urllib.parse.urlencode(params)
    print("Url Discord générée: ", url)
    return redirect(url)

def get_token_for_user(user) :
    if not user.is_active:
        raise AuthenticationFailed("L'utilisateur n'est pas actif.")
    
    refresh = RefreshToken.for_user(user)
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def discord_callback(request):
    print("=== CALLBACK DISCORD APPELÉ ===", flush=True)
    code = request.GET.get("code")
    print("CODE :", code, flush=True)

    if not code:
        return JsonResponse({"error": "No code provided"}, status=400)

    # 1️⃣ Échange du code contre un access_token
    token_response = requests.post(
        "https://discord.com/api/oauth2/token",
        data={
            "client_id": settings.DISCORD_CLIENT_ID,
            "client_secret": settings.DISCORD_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.DISCORD_REDIRECT_URI,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    print("STATUS : ", token_response.status_code, flush=True)
    
    if token_response.status_code != 200:
        return JsonResponse({"error": "Token exchange failed"}, status=400)

    token_json = token_response.json()
    access_token = token_json.get("access_token")

    if not access_token:
        return JsonResponse({"error": "No access token returned"}, status=400)

    # 2️⃣ Infos utilisateur
    user_response = requests.get(
        "https://discord.com/api/v10/users/@me",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    if user_response.status_code != 200:
        return JsonResponse({"error": "Failed to fetch user"}, status=400)

    user_data = user_response.json()

    avatar_hash = user_data.get("avatar")
    avatar_url = None

    if avatar_hash:
        avatar_url = f"https://cdn.discordapp.com/avatars/{user_data['id']}/{avatar_hash}.png"

    # 3️⃣ Création / mise à jour utilisateur
    user, created = User.objects.update_or_create(
        discord_id=user_data["id"],
        defaults={
            "username": user_data["username"],
            "avatar_url": avatar_url,
            "is_active": True,
        }
    )
    
    user_roles = get_user_roles(user.discord_id)
    # 4️⃣ Génération JWT
    tokens = get_token_for_user(user)

    response = redirect("http://localhost:4200/auth/success")

    response.set_cookie(
        key="access_token",
        value=tokens["access"],
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=60 * 5,
    )

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh"],
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=60 * 60 * 24,
    )

    return response
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request) :
    user = request.user  

    guilds = user.guilds.all()

    guilds_data = [
        {
            "id": g.guild_id,
            "name": g.name
        }
        for g in guilds
    ] 
    return Response({
        "id": user.id,  # ID interne application
        "username": user.username,
        "avatar_url": user.avatar_url,
        "guilds": guilds_data
    })

@api_view(["POST"])
def check_permission(request):
    guild_id = request.data.get("guild_id")
    role_ids = request.data.get("role_ids", [])
    permission_code = request.data.get("permission")

    if not guild_id or not permission_code:
        return Response({"allowed": False})

    has_permission = GuildRolePermission.objects.filter(
        guild__guild_id=guild_id,
        role_id__in=role_ids,
        permissions__code=permission_code
    ).exists()

    return Response({"allowed": has_permission})

@api_view(["POST"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def on_message(request):

    user = request.user
    content = request.data.get("message")
    # channel_id = request.data.get("idChannel")

    # if not channel_id : 
    #     return Response(
    #         {"error": "Id du channel manquant."}, status=status.HTTP_400_BAD_REQUEST
    #     )


    if not content:
        return Response(
            {"error": "Message manquant"},
            status=status.HTTP_400_BAD_REQUEST
        )
    user_discord_id = user.discord_id
    serializer = MessageSerializer(data={"content": content})

    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    serializer.save(user=user)
    data = {
        "message": content,
        # "channel": channel_id,
        "user_id": user_discord_id

    }

    url = "http://localhost:8001/voice_message/"

    response = requests.post(url, json=data)
    print("Status :", response.status_code)
    print("Response :", response.text)
    


    return Response({"detail": "Message enregistré"})

#Synchronisation des salon dans la db
def sync_channels():

    for discord_guild in bot.guilds: 

        guild = Guild.objects.filter(
            guild_id=discord_guild.id
        ).first()

        if not guild :
            continue

        #Pour chaque channel discord on récupère leur instance (channel textuel, vocal ou catégorie)
        for discord_channel in discord_guild.channels:
            if isinstance(discord_channel, discord.TextChannel):
                channel_type = "text"
            elif isinstance(discord_channel, discord.VoiceChannel):
                channel_type = "voice"
            
            elif isinstance(discord_channel, discord.CategoryChannel):
                channel_type = "category"
            
            else :
                continue

            Channel.objects.update_or_create(
                channel_id=discord_channel.id,
                defaults={
                    "name": discord_channel.name,
                    "channel_type": channel_type,
                    "guild": guild,
                }
            )
@api_view(["POST"])
def trigger_sync_channels(request):
    sync_channels()

    return Response(
        {
            "success": "Salon synchronés"
        },
        status=status.HTTP_200_OK
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_channels(request):

    guild = Guild.objects.first()

    if not guild:
        return Response(
            {"error": "Acune guild trouvée"}, status=status.HTTP_400_BAD_REQUEST
        )
    
    channels = Channel.objects.filter(guild=guild)

    serializer = ChannelSerializer(channels, many=True)

    return Response(serializer.data)

@csrf_exempt
@api_view(["POST"])
def sync_message(request) :
    # On récupère les channels et les messages
    channel_id = request.data.get("channel_id")
    messages = request.data.get("messages")

    #Si aucun channel_id ou messages est fourni
    if not channel_id or not messages :
        return Response(
            {"error": "Data manquante"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # On vérifie si il existe
    try : 
        channel = Channel.objects.get(channel_id=channel_id)
    
    except Channel.DoesNotExist :
        return Response(
            {"error": "Channel introuvable"},
            status=status.HTTP_404_NOT_FOUND
        )
    channel_layer = get_channel_layer()

    for msg in messages :
        #Pour chaque message on le créer
        message_obj, created = DiscordMessage.objects.update_or_create(
            message_id=msg["message_id"],
            defaults={
                "channel": channel,
                "author": msg["author"],
                "content": msg["content"],
                "discord_created_at": msg.get("discord_created_at")
            }
        )
        group_name = f"channel_{channel_id}"
        print("🔵 ENVOI AU GROUPE :", group_name)
        
        #On envoi au navigateur
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "new_message",
                "message": {
                    "author": message_obj.author,
                    "content": message_obj.content,
                    "discord_created_at": msg.get("discord_created_at")
                }
            }
        )
    return Response({"status": "Message synchronisés."})

#PERMET DE RÉCUPÉRER LES MESSAGES
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_message(request, channel_id): 

    channel = Channel.objects.get(channel_id=channel_id)

    if str(channel.guild.guild_id) != str(settings.BOT_GUILD_ID) :
        return Response({"error" : "Accès refusé"}, status=status.HTTP_403_FORBIDDEN)
    
    messages = DiscordMessage.objects.filter(
        channel__channel_id=channel_id
    ).order_by("discord_created_at")

    serializer = DiscordMessageSerializer(messages, many=True)

    return Response(serializer.data)

#Synchronisation des guilde dans la db
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def trigger_sync_guilds(request) :
    sync_guilds()

    return Response(
        {
            "success": "Guilds synchronisées."
        },
        status=status.HTTP_200_OK
    )

#On reçoit les rôles
@csrf_exempt
@api_view(["POST"])
def sync_roles(request):

    user = User.objects.get(discord_id=request.data["user_id"])
    guild = Guild.objects.get(guild_id=request.data["guild_id"])

    user.roles.clear()

    for r in request.data["roles"]:
        role_obj, _ = GuildRolePermission.objects.get_or_create(
            guild=guild,
            role_id=r["id"],
            defaults={"name": r["name"]}
        )
        user.roles.add(role_obj)

    return Response({"status": "roles synced"})

 #Demande au bot de rejoindre le salon vocal       
@api_view(["POST"])
def join_bot(request):
    #on récupère l'id discord de l'utilisateur
    discord_id = request.data.get("discord_id")

    #On vérifie que l'id discord est présent
    if not discord_id :
        return Response(
            {
                "error" : "L'identifiant discord n'est pas fournit."
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    member = connected_user(discord_id)

    if member is None :
        return Response(
            {
                "error": "L'utilisateur n'est pas connecté à un salon vocal."
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    future = asyncio.run_coroutine_threadsafe(
        connect_bot_voice_channel(member),
        bot.loop
    )
    try:
        channel_name = future.result(timeout=10)
    
    except Exception as e :
        print("Erreur connexion vocal :", e)

        return Response(
            {
                "error" :str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    return Response(
        {
            "success": "Utilisateur connecté à un salon vocal."
        },
        status=status.HTTP_200_OK
    )
