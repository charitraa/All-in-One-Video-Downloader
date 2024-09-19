import instaloader
import os
import tempfile
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer
import requests

class DownloadInstagramMedia(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']
            
            try:
                # Initialize Instaloader
                loader = instaloader.Instaloader()
                
                # Extract shortcode from URL
                shortcode = url.split('/')[-2]  # Adjust based on URL format
                
                # Get post details
                post = instaloader.Post.from_shortcode(loader.context, shortcode)
                
                if not post.is_video:
                    return Response({'error': 'The URL does not point to a video.'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Download video content
                video_url = post.video_url
                response = requests.get(video_url, stream=True)
                if response.status_code != 200:
                    return Response({'error': 'Failed to download video content.'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Save the video to a temporary file
                with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            temp_file.write(chunk)
                    temp_file_path = temp_file.name
                
                # Serve the video as a download
                with open(temp_file_path, 'rb') as video_file:
                    response = FileResponse(video_file, as_attachment=True, filename='instagram_video.mp4')

                # Clean up the temporary video file after serving
                os.remove(temp_file_path)

                return response

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DownloadInstagramStory(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['url']
            
            try:
                # Initialize Instaloader
                loader = instaloader.Instaloader()
                
                # Download Stories
                profile = instaloader.Profile.from_username(loader.context, username)
                stories = loader.get_stories(userids=[profile.userid])
                
                if not stories:
                    return Response({'error': 'No stories found for this user.'}, status=status.HTTP_404_NOT_FOUND)

                # Iterate over stories and save
                for story in stories:
                    for item in story.get_items():
                        if item.is_video:
                            video_url = item.video_url
                            response = requests.get(video_url, stream=True)
                            if response.status_code != 200:
                                return Response({'error': 'Failed to download video content.'}, status=status.HTTP_400_BAD_REQUEST)
                            
                            # Save the video to a temporary file
                            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
                                for chunk in response.iter_content(chunk_size=8192):
                                    if chunk:
                                        temp_file.write(chunk)
                                temp_file_path = temp_file.name
                            
                            # Serve the video as a download
                            with open(temp_file_path, 'rb') as video_file:
                                response = FileResponse(video_file, as_attachment=True, filename='instagram_story.mp4')

                            # Clean up the temporary video file after serving
                            os.remove(temp_file_path)
                            return response

                return Response({'error': 'No video stories found.'}, status=status.HTTP_404_NOT_FOUND)

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
