from datetime import timedelta

from django.db import models
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import filters, parsers, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Attachment, Nota, Tag
from .serializers import AttachmentSerializer, NotaSerializer, TagSerializer


class TagViewSet(viewsets.ModelViewSet):
    """API endpoint untuk Tag/Label."""
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user).annotate(
            nota_count=models.Count("notas")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AttachmentViewSet(viewsets.ModelViewSet):
    """API endpoint untuk File Attachment."""
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        nota_id = self.kwargs.get("nota_id")
        if nota_id:
            return Attachment.objects.filter(
                nota_id=nota_id, nota__author=self.request.user
            )
        return Attachment.objects.filter(nota__author=self.request.user)

    def perform_create(self, serializer):
        nota_id = self.kwargs.get("nota_id") or self.request.data.get("nota")
        nota = Nota.objects.get(id=nota_id, author=self.request.user)
        uploaded = self.request.FILES.get("file")
        serializer.save(
            nota=nota,
            filename=uploaded.name,
            file_size=uploaded.size,
            mime_type=uploaded.content_type or "application/octet-stream",
        )


class NotaViewSet(viewsets.ModelViewSet):
    """
    API endpoint untuk Nota (Catatan).

    Endpoints:
        GET    /api/notas/              - List semua nota user
        POST   /api/notas/              - Buat nota baru
        GET    /api/notas/{id}/         - Detail nota
        PUT    /api/notas/{id}/         - Update nota
        PATCH  /api/notas/{id}/         - Partial update
        DELETE /api/notas/{id}/         - Hapus nota
        POST   /api/notas/{id}/toggle_pin/ - Toggle pin
        POST   /api/notas/{id}/archive/    - Archive nota
        GET    /api/notas/stats/        - Statistik nota
        GET    /api/notas/export/       - Export semua nota (JSON)
        POST   /api/notas/import_notes/ - Import nota dari JSON
    """

    serializer_class = NotaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "content"]
    ordering_fields = ["created_at", "updated_at", "title"]

    def get_queryset(self):
        qs = Nota.objects.filter(author=self.request.user).prefetch_related(
            "tags", "attachments"
        )
        tag = self.request.query_params.get("tag")
        if tag:
            qs = qs.filter(tags__name__iexact=tag)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"])
    def toggle_pin(self, request, pk=None):
        nota = self.get_object()
        nota.is_pinned = not nota.is_pinned
        nota.save()
        return Response({"is_pinned": nota.is_pinned})

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        nota = self.get_object()
        nota.status = "archived"
        nota.save()
        return Response({"status": "archived"})

    @action(detail=False, methods=["get"])
    def stats(self, request):
        qs = Nota.objects.filter(author=request.user)
        last_7_days = timezone.now() - timedelta(days=7)
        return Response(
            {
                "total": qs.count(),
                "published": qs.filter(status="published").count(),
                "draft": qs.filter(status="draft").count(),
                "archived": qs.filter(status="archived").count(),
                "pinned": qs.filter(is_pinned=True).count(),
                "created_last_7_days": qs.filter(
                    created_at__gte=last_7_days
                ).count(),
            }
        )

    @action(detail=False, methods=["get"])
    def export(self, request):
        """Export semua nota user sebagai JSON."""
        notas = Nota.objects.filter(author=request.user).prefetch_related(
            "tags", "attachments"
        )
        data = []
        for nota in notas:
            data.append(
                {
                    "id": nota.id,
                    "title": nota.title,
                    "content": nota.content,
                    "content_type": nota.content_type,
                    "status": nota.status,
                    "is_pinned": nota.is_pinned,
                    "tags": [
                        {"name": t.name, "color": t.color} for t in nota.tags.all()
                    ],
                    "created_at": nota.created_at.isoformat(),
                    "updated_at": nota.updated_at.isoformat(),
                    "attachments": [
                        {
                            "filename": a.filename,
                            "file_size": a.file_size,
                            "mime_type": a.mime_type,
                        }
                        for a in nota.attachments.all()
                    ],
                }
            )
        response = JsonResponse(
            {"notas": data, "count": len(data)}, json_dumps_params={"indent": 2}
        )
        response["Content-Disposition"] = 'attachment; filename="nota-export.json"'
        return response

    @action(detail=False, methods=["post"])
    def import_notes(self, request):
        """Import nota dari JSON payload."""
        notas_data = request.data.get("notas", [])
        if not isinstance(notas_data, list):
            return Response(
                {"detail": 'Format: {"notas": [...]}'}, status=status.HTTP_400_BAD_REQUEST
            )

        imported = 0
        errors = []
        for i, item in enumerate(notas_data):
            try:
                nota = Nota.objects.create(
                    title=item.get("title", "Imported #" + str(i + 1)),
                    content=item.get("content", ""),
                    content_type=item.get("content_type", "plain"),
                    status=item.get("status", "draft"),
                    is_pinned=item.get("is_pinned", False),
                    author=request.user,
                )
                for tag_data in item.get("tags", []):
                    tag, _ = Tag.objects.get_or_create(
                        name=tag_data["name"],
                        user=request.user,
                        defaults={"color": tag_data.get("color", "#3b82f6")},
                    )
                    nota.tags.add(tag)
                imported += 1
            except Exception as e:
                errors.append({"index": i, "error": str(e)})

        return Response(
            {
                "imported": imported,
                "total": len(notas_data),
                "errors": errors,
            }
        )
