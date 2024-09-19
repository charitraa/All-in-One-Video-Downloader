from tiktokapi.tiktok import TikTokApi
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer
import requests
import os
import tempfile

class DownloadTikTokVideo(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']
            
            try:
                # Initialize TikTok API
                api = TikTokApi.get_instance()

                # Extract video ID from URL
                video_id = url.split('/')[-1]  # Adjust based on actual URL format
                
                # Get video details
                video = api.video(id=video_id)
                video_url = video.download_url  # Adjust based on actual API response
                
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
                    response = FileResponse(video_file, as_attachment=True, filename='tiktok_video.mp4')

                # Clean up the temporary video file after serving
                os.remove(temp_file_path)

                return response

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
