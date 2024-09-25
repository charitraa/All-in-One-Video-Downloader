from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer
import yt_dlp
from io import BytesIO

class DownloadYouTubeVideo(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']

            try:
                # Set up an in-memory buffer to store the video
                buffer = BytesIO()

                # yt-dlp options to download video directly into buffer
                ydl_opts = {
                    'format': 'best',  # Best available quality
                    'outtmpl': '-',    # Write to stdout
                    'quiet': True,     # Disable verbose logs
                    'postprocessors': [{
                        'key': 'FFmpegExtractAudio',  # Optional: extract audio if needed
                        'preferredcodec': 'mp4',      # Output format
                        'preferredquality': '192',     # Bitrate
                    }],
                    'writeinfojson': True,  # Get video info
                }

                # Use yt-dlp to download the video
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.download([url])

                buffer.seek(0)  # Rewind the buffer to the beginning

                # Serve the file as a downloadable response to the user
                response = StreamingHttpResponse(buffer, content_type='video/mp4')
                response['Content-Disposition'] = 'attachment; filename="youtube_video.mp4"'

                return response

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
