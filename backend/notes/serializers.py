from django.db import IntegrityError
from rest_framework import serializers
from .models import Nota, Tag, Attachment


class TagSerializer(serializers.ModelSerializer):
    nota_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'nota_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        """Cek duplikasi tag untuk user yang sama."""
        user = self.context['request'].user
        qs = Tag.objects.filter(name=value, user=user)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Tag dengan nama ini sudah ada.")
        return value


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'nota', 'file', 'filename', 'file_size', 'mime_type', 'uploaded_at']
        read_only_fields = ['id', 'filename', 'file_size', 'mime_type', 'uploaded_at']


class NotaSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    summary = serializers.CharField(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Nota
        fields = [
            'id', 'title', 'content', 'content_type', 'status',
            'author', 'author_username', 'is_pinned',
            'tags', 'tag_ids', 'attachments',
            'summary', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        nota = Nota.objects.create(**validated_data)
        if tag_ids:
            valid_tags = Tag.objects.filter(id__in=tag_ids, user=nota.author)
            nota.tags.set(valid_tags)
        return nota

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_ids is not None:
            valid_tags = Tag.objects.filter(id__in=tag_ids, user=instance.author)
            instance.tags.set(valid_tags)
        return instance
