from pytube import YouTube
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer
import os

import os

class DownloadYouTubeVideo(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']
            
            try:
                yt = YouTube(url)
                video_stream = yt.streams.get_highest_resolution()

                video_path = video_stream.download(output_path='videos', filename='youtube_video.mp4')

                response = FileResponse(open(video_path, 'rb'), as_attachment=True, filename='youtube_video.mp4')
                
                # Remove the file after response is generated
                os.remove(video_path)

                return response

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
