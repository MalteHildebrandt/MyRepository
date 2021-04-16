from django.shortcuts import render
from django.http import HttpResponse
import os

# Create your views here.


def index(request):
    message = os.environ['TEST_ENV_VAR']
    return HttpResponse(message)