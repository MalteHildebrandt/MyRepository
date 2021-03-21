import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

from .models import User, Post

def index(request):
    if request.method == "POST":
        newPost = Post(user=request.user, text=request.POST["text"])
        newPost.save()
        return HttpResponseRedirect(reverse("index"))

    posts = Post.objects.all()
    posts = posts.order_by("-timestamp").all()

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "network/index.html", {   
        "posts" : page_obj
    })

def network(request):
    users = User.objects.all()
    return render(request, "network/network.html", {
        "users" : users
    })

@login_required
def following(request):
    follows = request.user.follows.all()
    posts = Post.objects.filter(user__in=follows)
    posts = posts.order_by("-timestamp").all()
    
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, "network/following.html", {
        "posts" : page_obj
    })

def profile(request, user_id):
    userviewed=User.objects.get(id=user_id)
    numfollowers = userviewed.followers.all().count()
    numfollows = userviewed.follows.all().count()
    posts = Post.objects.filter(user=userviewed)
    posts = posts.order_by("-timestamp").all()

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    follows = False
    if request.user.is_authenticated:
        if userviewed in request.user.follows.all():
            follows = True

    return render(request, "network/profile.html", {
        "numfollowers" : numfollowers,
        "numfollows" : numfollows,
        "posts" : page_obj,
        "userviewed" : userviewed,
        "follows": follows
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

# API views

@csrf_exempt
@login_required
def like(request):

    # liking a Post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # get the data
    data = json.loads(request.body)
    postid = data.get("postid")
    like = data.get("like")

    try:
            post = Post.objects.get(id=postid)
            if like:
                post.likers.add(request.user)
            else:
                post.likers.remove(request.user)
            likercount = post.likers.all().count()
            return JsonResponse({
                        "message": "liked successfully.",
                        "likecount": likercount
                        },  status=201)

    except Post.DoesNotExist:
        return JsonResponse({
            "error": f"Post with id {postid} does not exist."
        }, status=400)

@csrf_exempt
@login_required
def edit(request):

    # editing a Post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # get the data
    data = json.loads(request.body)
    postid = data.get("postid")
    text = data.get("text")
    try:
        post = Post.objects.get(id=postid)
        post.text = text
        post.save()
        return JsonResponse({
                    "message": "updated successfully.",
                    },  status=201)

    except Post.DoesNotExist:
        return JsonResponse({
            "error": f"Post with id {postid} does not exist."
        }, status=400)

@csrf_exempt
@login_required
def follow(request):

    # editing a Post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # get the data
    data = json.loads(request.body)
    userid = data.get("userid")
    follow = data.get("follow")
    try:
        user = User.objects.get(id=userid)
        if follow:
            request.user.follows.add(user)
        else:
            request.user.follows.remove(user)
        request.user.save()
        return JsonResponse({
                    "message": "updated successfully.",
                    },  status=201)

    except Post.DoesNotExist:
        return JsonResponse({
            "error": f"user could not be followed / unfollowed."
        }, status=400)



