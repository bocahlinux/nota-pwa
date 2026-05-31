from django.db import models
from django.contrib.auth.models import User


class Tag(models.Model):
    """Tag / label untuk nota."""
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#3b82f6', help_text="Hex color, e.g. #3b82f6")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['name', 'user']
        ordering = ['name']

    def __str__(self):
        return self.name


class Nota(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=200)
    content = models.TextField(blank=True, default='')
    content_type = models.CharField(
        max_length=10,
        choices=[('plain', 'Plain Text'), ('markdown', 'Markdown')],
        default='plain',
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notas')
    tags = models.ManyToManyField(Tag, blank=True, related_name='notas')
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_pinned', '-updated_at']

    def __str__(self):
        return self.title

    @property
    def summary(self):
        return self.content[:100] + ('...' if len(self.content) > 100 else '')


class Attachment(models.Model):
    """File attachment untuk nota."""
    nota = models.ForeignKey(Nota, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/%Y/%m/%d/')
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0, help_text="Size in bytes")
    mime_type = models.CharField(max_length=100, default='application/octet-stream')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.filename

    def delete(self, *args, **kwargs):
        # Delete file on storage when model is deleted
        self.file.delete(save=False)
        super().delete(*args, **kwargs)
