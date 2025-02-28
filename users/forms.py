from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    """Form for creating a new user with role selection."""
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'role', 'password1', 'password2')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'].required = True

class LoginForm(forms.Form):
    """Form for user login."""
    username = forms.CharField(max_length=150)
    password = forms.CharField(widget=forms.PasswordInput)

class MFASetupForm(forms.Form):
    """Form for MFA setup and verification."""
    token = forms.CharField(
        max_length=6,
        min_length=6,
        widget=forms.TextInput(attrs={'autocomplete': 'off', 'placeholder': 'Enter 6-digit code'})
    )