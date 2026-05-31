from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotaViewSet, TagViewSet, AttachmentViewSet
from .push_views import subscribe_push, unsubscribe_push, vapid_public_key, send_notification

router = DefaultRouter()
router.register(r'notas', NotaViewSet, basename='nota')
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = [
    path('api/', include(router.urls)),
    # Push notifications
    path('api/push/subscribe/', subscribe_push, name='push-subscribe'),
    path('api/push/unsubscribe/', unsubscribe_push, name='push-unsubscribe'),
    path('api/push/vapid-key/', vapid_public_key, name='push-vapid-key'),
    path('api/push/send/', send_notification, name='push-send'),
    # Nested attachments
    path('api/notas/<int:nota_id>/attachments/', AttachmentViewSet.as_view({'get': 'list', 'post': 'create'}), name='nota-attachments'),
    path('api/notas/<int:nota_id>/attachments/<int:pk>/', AttachmentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='nota-attachment-detail'),
    # Auth fallback for browsable API
    path('api/auth/', include('rest_framework.urls')),
]
