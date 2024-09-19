import yt_dlp
import os
import tempfile
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer
import requests

class DownloadFacebookVideo(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']
            
            try:
                # Initialize yt-dlp
                ydl_opts = {
                    'format': 'bestvideo+bestaudio/best',
                    'outtmpl': '%(temp_filename)s',
                    'noplaylist': True,
                }
                
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info_dict = ydl.extract_info(url, download=False)
                    video_url = info_dict.get('url', None)
                    if not video_url:
                        return Response({'error': 'Failed to extract video URL.'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Download video content
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
                        response = FileResponse(video_file, as_attachment=True, filename='facebook_video.mp4')
                    
                    # Clean up the temporary video file after serving
                    os.remove(temp_file_path)

                    return response

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DownloadFacebookStory(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']

            try:
                # yt-dlp options for Facebook video download
                ydl_opts = {
                    'format': 'bestvideo+bestaudio/best',
                    'outtmpl': '%(temp_filename)s',
                    'noplaylist': True,
                }

                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info_dict = ydl.extract_info(url, download=False)
                    video_url = info_dict.get('url', None)
                    
                    if not video_url:
                        return Response({'error': 'Failed to extract video URL.'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Download video content
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
                        response = FileResponse(video_file, as_attachment=True, filename='facebook_story.mp4')
                    
                    # Clean up the temporary video file after serving
                    os.remove(temp_file_path)

                    return response

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

