from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
import requests
from django.conf import settings
from .models import ChatMessage
from .serializers import ChatMessageSerializer


@api_view(['GET'])
def chat_history(request):
    """
    Load chat history for room1, manually verifying token with the User Service.
    """
    # Get token from Authorization header
    token = request.headers.get('Authorization', None)
    if token:
        try:
            # Extract token without 'Bearer' prefix
            token = token.split(' ')[1]
            print(f"Extracted Token: {token}")  # Debug: Print extracted token

            # Call the verify endpoint on User Service (running on 8000)
            verify_url = f"{settings.USER_SERVICE_URL}verify/"
            headers = {
                'Authorization': f'Bearer {token}'
            }
            response = requests.get(verify_url, headers=headers)

            # If token is valid, proceed with fetching chat history
            if response.status_code == 200:
                messages = ChatMessage.objects.filter(room_name='room1').order_by('timestamp')
                serializer = ChatMessageSerializer(messages, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                # If token is invalid, print and return 401 Unauthorized
                print(f"Invalid Token: {token}")  # Debug: Print invalid token
                print(f"Verify Response: {response.json()}")  # Debug: Print verify response
                return Response({'detail': 'Invalid or expired token', 'token': token}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            print(f"Exception: {str(e)}")  # Debug: Print exception details
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        # No token provided
        print("No Token Provided")  # Debug: Print if no token is provided
        return Response({'detail': 'Token not provided'}, status=status.HTTP_400_BAD_REQUEST)
