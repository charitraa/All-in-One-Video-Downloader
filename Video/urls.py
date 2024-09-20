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
from instagram import views as insatagram_views
from twitter import views as twitter_views
from facebook import views as facebook_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('download/youtube/', youtube_views.DownloadYouTubeVideo.as_view(), name='download_youtube'),
    # path('download/linkedin/', DownloadLinkedInVideo.as_view(), name='download_linkedin'),
    path('download/instagram/', insatagram_views.DownloadInstagramMedia.as_view(), name='download_instagram'),
    path('download/facebook/', facebook_views.DownloadFacebookVideo.as_view(), name='download_facebook'),
    path('download/twitter/', twitter_views.DownloadTwitterVideo.as_view(), name='download_twitter'),

]
