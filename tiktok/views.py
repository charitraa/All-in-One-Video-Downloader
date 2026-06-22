import yt_dlp
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer
from django.conf import settings
import os
import tempfile


class SelfDeletingFileResponse(FileResponse):
    def __init__(self, path, *args, **kwargs):
        self._path_to_delete = path
        super().__init__(open(path, 'rb'), *args, **kwargs)

    def close(self):
        super().close()
        try:
            os.remove(self._path_to_delete)
        except OSError:
            pass


class DownloadTikTokVideo(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        url = serializer.validated_data['url']

        # Use a temp DIRECTORY so yt-dlp controls the filename — no pre-existing file conflict
        tmp_dir = tempfile.mkdtemp()
        tmp_path = os.path.join(tmp_dir, 'video.mp4')

        try:
            ydl_opts = {
                'format': 'best',
                'outtmpl': tmp_path,
                'noplaylist': True,
                'quiet': False,
                'overwrites': True,  # Force overwrite even if file exists
                # '' = direct connection (ignores inherited env proxies);
                # set YTDLP_PROXY to route through a proxy.
                'proxy': settings.YTDLP_PROXY,
                'extractor_args': {
                    'tiktok': {
                        'api_hostname': ['api16-normal-c-useast1a.tiktokv.com']
                    }
                }
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])

            # yt-dlp may choose a different extension; find whatever was downloaded
            actual_path = tmp_path
            if not os.path.exists(actual_path) or os.path.getsize(actual_path) == 0:
                # Look for any file yt-dlp wrote in the temp dir
                files = [f for f in os.listdir(tmp_dir) if os.path.isfile(os.path.join(tmp_dir, f))]
                if not files:
                    return Response(
                        {'error': 'Download failed or produced an empty file'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                actual_path = os.path.join(tmp_dir, files[0])

            if os.path.getsize(actual_path) == 0:
                return Response(
                    {'error': 'Downloaded file is empty'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return SelfDeletingFileResponse(
                actual_path,
                as_attachment=True,
                filename='tiktok_video.mp4',
                content_type='video/mp4',
            )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        finally:
            # Clean up the directory itself (SelfDeletingFileResponse handles the file)
            try:
                os.rmdir(tmp_dir)
            except OSError:
                pass  # Non-empty dir means the file still exists — that's fine