from django.contrib import admin
from .models import Nota, Tag, Attachment, PushSubscription, NotificationLog


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


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'endpoint_preview', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__username', 'endpoint']
    readonly_fields = ['endpoint', 'p256dh', 'auth', 'created_at', 'updated_at']

    def endpoint_preview(self, obj):
        return obj.endpoint[:60] + '...' if len(obj.endpoint) > 60 else obj.endpoint
    endpoint_preview.short_description = 'Endpoint'


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'success', 'sent_at']
    list_filter = ['success', 'sent_at']
    search_fields = ['title', 'user__username']
    readonly_fields = ['title', 'body', 'user', 'sent_at', 'success']
