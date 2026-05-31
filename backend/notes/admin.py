from django.contrib import admin
from .models import Nota, Tag, Attachment


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'user', 'created_at']
    list_filter = ['user']
    search_fields = ['name']


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 0
    readonly_fields = ['filename', 'file_size', 'mime_type', 'uploaded_at']


@admin.register(Nota)
class NotaAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status', 'is_pinned', 'updated_at']
    list_filter = ['status', 'is_pinned', 'content_type']
    search_fields = ['title', 'content']
    filter_horizontal = ['tags']
    inlines = [AttachmentInline]


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ['filename', 'nota', 'file_size', 'mime_type', 'uploaded_at']
    list_filter = ['mime_type']
    search_fields = ['filename']
