import snscrape.modules.twitter as sntwitter
import requests
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer
import os
import tempfile

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
                try:
                    video_content = requests.get(video_url).content
                except requests.exceptions.RequestException as e:
                    return Response({'error': 'Failed to download the video: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # Use a temporary file to serve the video
                with tempfile.NamedTemporaryFile(delete=False) as temp_video:
                    temp_video.write(video_content)
                    temp_video.flush()
                    response = FileResponse(open(temp_video.name, 'rb'), as_attachment=True, filename='twitter_video.mp4')
                
                # Clean up the temporary file after serving
                os.remove(temp_video.name)
                
                return response

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
