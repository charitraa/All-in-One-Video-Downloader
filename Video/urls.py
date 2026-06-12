"""
URL configuration for Video project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from youtube import views as youtube_views
from instagram import views as instagram_views
from twitter import views as twitter_views
from facebook import views as facebook_views
from tiktok import views as tiktok_views
from reddit import views as reddit_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('download/youtube/', youtube_views.DownloadYouTubeVideo.as_view(), name='download_youtube'),
    path('download/instagram/', instagram_views.DownloadInstagramMedia.as_view(), name='download_instagram'),
    path('download/instagram/story/', instagram_views.DownloadInstagramStory.as_view(), name='download_instagram_story'),
    path('download/instagram_story/', instagram_views.DownloadInstagramStory.as_view(), name='download_instagram_story_alt'),
    path('download/facebook/', facebook_views.DownloadFacebookVideo.as_view(), name='download_facebook'),
    path('download/facebook/story/', facebook_views.DownloadFacebookStory.as_view(), name='download_facebook_story'),
    path('download/facebook_story/', facebook_views.DownloadFacebookStory.as_view(), name='download_facebook_story_alt'),
    path('download/twitter/', twitter_views.DownloadTwitterVideo.as_view(), name='download_twitter'),
    path('download/tiktok/', tiktok_views.DownloadTikTokVideo.as_view(), name='download_tiktok'),
    path('download/reddit/', reddit_views.DownloadRedditVideo.as_view(), name='download_reddit'),
]
