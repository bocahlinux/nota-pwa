from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotaViewSet, TagViewSet, AttachmentViewSet

router = DefaultRouter()
router.register(r'notas', NotaViewSet, basename='nota')
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = [
    path('api/', include(router.urls)),
    # Nested attachments: /api/notas/{nota_id}/attachments/
    path('api/notas/<int:nota_id>/attachments/', AttachmentViewSet.as_view({'get': 'list', 'post': 'create'}), name='nota-attachments'),
    path('api/notas/<int:nota_id>/attachments/<int:pk>/', AttachmentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='nota-attachment-detail'),
    # Auth fallback for browsable API
    path('api/auth/', include('rest_framework.urls')),
]
