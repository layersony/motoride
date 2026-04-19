from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed


class SilentJWTAuthentication(JWTAuthentication):
    """
    JWT authentication that returns anonymous (None) instead of raising
    AuthenticationFailed when the token is invalid or expired.

    This allows public (AllowAny) endpoints to work even when the browser
    sends a stale/expired token stored in localStorage, while protected
    endpoints still reject unauthenticated requests via permission classes.
    """

    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except (InvalidToken, AuthenticationFailed):
            return None
