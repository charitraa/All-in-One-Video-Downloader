import os
import tempfile
import yt_dlp
from django.conf import settings
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer


class DownloadYouTubeVideo(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        url = serializer.validated_data['url']
        try:
            temp_dir = tempfile.mkdtemp()
            ydl_opts = {
                'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best',
                'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
                'noplaylist': True,
                'merge_output_format': 'mp4',
                'quiet': False,
                'cookiefile': settings.COOKIES_FILE,
                'proxy': settings.YTDLP_PROXY,
                # YouTube's n-challenge needs a JS runtime; yt-dlp does not
                # auto-detect one, so register node explicitly (path=None ->
                # found on PATH). Requires the yt-dlp-ejs solver scripts.
                'js_runtimes': {'node': {'path': None}},
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                file_path = ydl.prepare_filename(info)
                if not os.path.exists(file_path):
                    base = os.path.splitext(file_path)[0]
                    mp4_path = f"{base}.mp4"
                    if os.path.exists(mp4_path):
                        file_path = mp4_path
                if not os.path.exists(file_path):
                    return Response(
                        {'error': 'Downloaded file not found'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                return FileResponse(
                    open(file_path, 'rb'),
                    as_attachment=True,
                    filename=os.path.basename(file_path)
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )