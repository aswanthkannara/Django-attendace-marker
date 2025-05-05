from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .models import User
from locations.models import Worksite

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class RegisterView(APIView):
    """
    API endpoint for user registration
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    API endpoint for user login
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        print('userrrrrrr')
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(request, username=username, password=password)
            
            if user:
                login(request, user)
                return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
            
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """
    API endpoint for user logout
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """
    Get the current logged-in user
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# Web Views for Django Templates

def login_view(request):
    """
    Login page view
    """
    if request.user.is_authenticated:
        if request.user.role == 'employee':
            print("here 83")
            # For employees, redirect to check-in page
            worksites = Worksite.objects.filter(active=True).first()
            if worksites:
                return redirect('check_in', worksite_id=worksites.id)
        else:
            # For managers/admins, redirect to dashboard
            return redirect('dashboard')
    
    error_message = None
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        print("hiiiiii")
        if username and password:
            user = User.objects.filter(username=username, password=password).first()
            print('userrrrr')
            if user:
                login(request, user)
                
                if user.role == 'employee':
                    print("hiiiii     aswanth")
                    # For employees, redirect to check-in page
                    worksites = Worksite.objects.filter(active=True).first()
                    if worksites:
                        print("this is the issue")
                        return redirect('check_in', worksite_id=worksites.id)
                else:
                    # For managers/admins, redirect to dashboard
                    return redirect('dashboard')
            else:
                error_message = "Invalid username or password."
        else:
            error_message = "Please enter both username and password."
    
    return render(request, 'accounts/login.html', {'error_message': error_message})

def logout_view(request):
    """
    Logout view
    """
    logout(request)
    return redirect('login_view')
