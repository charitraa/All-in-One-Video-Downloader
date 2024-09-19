from rest_framework import serializers

class VideoDownloadSerializer(serializers.Serializer):
    url = serializers.URLField()
