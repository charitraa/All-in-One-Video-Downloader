import yt_dlp
import os
import base64
import re
import tempfile
from django.conf import settings
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoDownloadSerializer


def normalize_facebook_story_url(url):
    """Convert a modern /stories/<owner_id>/<base64-story-id>/ URL into the
    canonical story.php?story_fbid=<id>&id=<owner> form that yt-dlp's Facebook
    extractor targets. Returns the original url if it isn't that format.

    The second path segment base64-decodes to e.g. "S:_ISC:1510729770612591";
    the trailing number is the real story_fbid.
    """
    m = re.search(r'facebook\.com/stories/(\d+)/([^/?]+)', url)
    if not m:
        return url
    owner_id, encoded = m.group(1), m.group(2)
    try:
        decoded = base64.b64decode(encoded + '=' * (-len(encoded) % 4)).decode('utf-8', 'replace')
    except Exception:
        return url
    fbid_match = re.search(r'(\d{6,})', decoded)
    if not fbid_match:
        return url
    return f'https://www.facebook.com/story.php?story_fbid={fbid_match.group(1)}&id={owner_id}'

class DownloadFacebookVideo(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']
            
            try:
                temp_dir = tempfile.mkdtemp()

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
                        filename='facebook_video.mp4'
                    )

            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DownloadFacebookStory(APIView):
    def post(self, request):
        serializer = VideoDownloadSerializer(data=request.data)
        if serializer.is_valid():
            # Normalize modern /stories/<id>/<b64>/ links to the story.php form
            # yt-dlp's extractor understands.
            url = normalize_facebook_story_url(serializer.validated_data['url'])

            try:
                temp_dir = tempfile.mkdtemp()

                # yt-dlp options for Facebook video download
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
                    filename='facebook_story.mp4'
                )

            except Exception as e:
                msg = str(e)
                # yt-dlp currently cannot extract Facebook Stories (the /stories/
                # page structure is unsupported). Surface a clear message instead
                # of a raw 500 so the frontend can show something useful.
                if 'Cannot parse data' in msg or 'Unsupported URL' in msg:
                    return Response(
                        {'error': 'Facebook Stories are not currently supported by the downloader.'},
                        status=status.HTTP_422_UNPROCESSABLE_ENTITY
                    )
                return Response({'error': msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

