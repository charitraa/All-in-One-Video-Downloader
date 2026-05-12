import yt_dlp
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer
import os
import tempfile

class DownloadRedditVideo(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']

            try:
                # yt-dlp options for Reddit video download
                ydl_opts = {
                    'format': 'bestvideo+bestaudio/best',
                    'outtmpl': '%(temp_filename)s',
                    'noplaylist': True,
                }

                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    # Download directly to a temporary file
                    info_dict = ydl.extract_info(url, download=True)
                    video_path = ydl.prepare_filename(info_dict)

                    # Check if download was successful
                    if not os.path.exists(video_path):
                        return Response({'error': 'Failed to download video.'}, status=status.HTTP_400_BAD_REQUEST)

                    # Serve the video as a download
                    with open(video_path, 'rb') as video_file:
                        response = FileResponse(video_file, as_attachment=True, filename='reddit_video.mp4')

                    # Clean up the temporary video file after serving
                    os.remove(video_path)

                    return response

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
