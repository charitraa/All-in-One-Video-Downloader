import yt_dlp
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer
from django.conf import settings
import os
import tempfile


class DownloadRedditVideo(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']
            try:
                temp_dir = tempfile.mkdtemp()
                ydl_opts = {
                    'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best',
                    'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
                    'noplaylist': True,
                    'merge_output_format': 'mp4',
                    'proxy': settings.YTDLP_PROXY,
                }
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info_dict = ydl.extract_info(url, download=True)
                    video_path = ydl.prepare_filename(info_dict)
                    if not os.path.exists(video_path):
                        base = os.path.splitext(video_path)[0]
                        mp4_path = f"{base}.mp4"
                        if os.path.exists(mp4_path):
                            video_path = mp4_path
                    if not os.path.exists(video_path):
                        return Response({'error': 'Failed to download video.'}, status=status.HTTP_400_BAD_REQUEST)
                    return FileResponse(
                        open(video_path, 'rb'),
                        as_attachment=True,
                        filename='reddit_video.mp4'
                    )
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)