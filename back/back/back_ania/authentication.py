from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework import exceptions
from rest_framework.authentication import SessionAuthentication

class CookieJWTAuthentication(JWTAuthentication) :
    def authenticate(self, request):
        # print("Cookies reçus :", list(request.COOKIES.keys()), flush=True)
        access_token = request.COOKIES.get("access_token")

        # print("Access token présent :", bool(access_token), flush=True)
        
        #On vérifie si le access_token est présent
        if not access_token:
            return None
        
        try :
            #On vérifie si il est valide
            validated_token = self.get_validated_token(access_token)
        
        except Exception : 
            raise exceptions.AuthenticationFailed("Invalid or expired token")
        
        user = self.get_user(validated_token)

        if user is None : 
            raise exceptions.AuthenticationFailed("User no found")
        
        SessionAuthentication().enforce_csrf(request)
        
        return (user, validated_token)