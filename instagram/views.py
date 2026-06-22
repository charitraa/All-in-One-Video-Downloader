import yt_dlp
import os
import tempfile
from django.conf import settings
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer

class DownloadInstagramMedia(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']

            try:
                temp_dir = tempfile.mkdtemp()

                # yt-dlp options for Instagram video download
                ydl_opts = {
                    'format': 'bestvideo+bestaudio/best',
                    'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
                    'noplaylist': True,
                    'merge_output_format': 'mp4',
                    # Stories / private content require a logged-in session.
                    # Use a Netscape-format cookies.txt (browser cookie jars are
                    # unavailable on a headless server like PythonAnywhere).
                    'cookiefile': settings.COOKIES_FILE,
                }

                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info_dict = ydl.extract_info(url, download=True)
                    video_path = ydl.prepare_filename(info_dict)

                    # After merging, the real file may carry the .mp4 extension
                    if not os.path.exists(video_path):
                        base = os.path.splitext(video_path)[0]
                        mp4_path = f"{base}.mp4"
                        if os.path.exists(mp4_path):
                            video_path = mp4_path

                    # Check if download was successful
                    if not os.path.exists(video_path):
                        return Response({'error': 'Failed to download video.'}, status=status.HTTP_400_BAD_REQUEST)

                    # Serve the video as a download
                    return FileResponse(
                        open(video_path, 'rb'),
                        as_attachment=True,
                        filename='instagram_video.mp4'
                    )

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DownloadInstagramStory(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']

            try:
                temp_dir = tempfile.mkdtemp()

                # yt-dlp options for Instagram story download
                ydl_opts = {
                    'format': 'bestvideo+bestaudio/best',
                    'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
                    'noplaylist': True,
                    'merge_output_format': 'mp4',
                    # Stories / private content require a logged-in session.
                    # Use a Netscape-format cookies.txt (browser cookie jars are
                    # unavailable on a headless server like PythonAnywhere).
                    'cookiefile': settings.COOKIES_FILE,
                }

                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.extract_info(url, download=True)

                # A story is returned as a (single-item) playlist, so
                # prepare_filename() points at the wrong name. Instead, take
                # whatever media file yt-dlp actually wrote into the temp dir.
                files = [
                    os.path.join(temp_dir, f) for f in os.listdir(temp_dir)
                    if os.path.isfile(os.path.join(temp_dir, f))
                    and os.path.getsize(os.path.join(temp_dir, f)) > 0
                ]
                if not files:
                    return Response({'error': 'Failed to download story.'}, status=status.HTTP_400_BAD_REQUEST)

                # Prefer the merged mp4, otherwise fall back to the largest file.
                mp4s = [f for f in files if f.lower().endswith('.mp4')]
                video_path = (mp4s or sorted(files, key=os.path.getsize, reverse=True))[0]

                # Serve the video as a download
                return FileResponse(
                    open(video_path, 'rb'),
                    as_attachment=True,
                    filename='instagram_story.mp4'
                )

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
