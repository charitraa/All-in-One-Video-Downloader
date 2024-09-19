import snscrape.modules.twitter as sntwitter
import requests
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer
import os

class DownloadTwitterVideo(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']
            
            try:
                tweet_id = url.split('/')[-1]  # Extract tweet ID from URL
                tweet = next(sntwitter.TwitterTweetScraper(tweet_id).get_items())
                
                if not tweet.media:
                    return Response({'error': 'No media found in the tweet.'}, status=status.HTTP_400_BAD_REQUEST)
                
                video_url = None
                for media in tweet.media:
                    if hasattr(media, 'video'):
                        video_url = media.video.variants[0].url
                        break
                
                if not video_url:
                    return Response({'error': 'No video found in the tweet.'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Download the video
                video_content = requests.get(video_url).content
                video_path = 'videos/twitter_video.mp4'
                os.makedirs(os.path.dirname(video_path), exist_ok=True)
                with open(video_path, 'wb') as video_file:
                    video_file.write(video_content)
                
                # Serve the video as a download
                response = FileResponse(open(video_path, 'rb'), as_attachment=True, filename='twitter_video.mp4')
                
                # Clean up the video file after serving
                os.remove(video_path)

                return response

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
