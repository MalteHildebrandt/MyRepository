from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    follows = models.ManyToManyField("User", related_name="followers")

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    text = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    likers = models.ManyToManyField("User", related_name="posts_liked")



