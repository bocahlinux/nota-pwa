from rest_framework import serializers, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
from django.contrib.auth.models import User
from .models import PushSubscription, NotificationLog
import json

try:
    from webpush import send_user_notification, WebPushException
    WEBPUSH_AVAILABLE = True
except ImportError:
    WEBPUSH_AVAILABLE = False


class PushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushSubscription
        fields = ['id', 'endpoint', 'p256dh', 'auth', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        endpoint = validated_data['endpoint']

        # Update jika sudah ada
        sub, created = PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                'user': user,
                'p256dh': validated_data['p256dh'],
                'auth': validated_data['auth'],
                'is_active': True,
            }
        )
        return sub


class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = ['id', 'title', 'body', 'sent_at', 'success']
        read_only_fields = fields


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def subscribe_push(request):
    """Subscribe browser untuk push notifications."""
    data = request.data.copy()
    sub, created = PushSubscription.objects.update_or_create(
        endpoint=data.get('endpoint', ''),
        defaults={
            'user': request.user,
            'p256dh': data.get('keys', {}).get('p256dh', ''),
            'auth': data.get('keys', {}).get('auth', ''),
            'is_active': True,
        }
    )
    return Response({'detail': 'Subscribed.', 'created': created}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unsubscribe_push(request):
    """Unsubscribe dari push notifications."""
    endpoint = request.data.get('endpoint', '')
    PushSubscription.objects.filter(endpoint=endpoint, user=request.user).update(is_active=False)
    return Response({'detail': 'Unsubscribed.'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def vapid_public_key(request):
    """Return VAPID public key untuk browser subscription."""
    return Response({'publicKey': settings.WEBPUSH_SETTINGS.get('VAPID_PUBLIC_KEY', '')})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_notification(request):
    """
    Kirim push notification.
    Body: {"title": "...", "body": "...", "user_id": optional}
    """
    if not WEBPUSH_AVAILABLE:
        return Response({'detail': 'WebPush not available.'}, status=status.HTTP_501_NOT_IMPLEMENTED)

    title = request.data.get('title', 'Nota')
    body = request.data.get('body', '')
    target_user_id = request.data.get('user_id')

    if target_user_id:
        subscriptions = PushSubscription.objects.filter(
            user_id=target_user_id, is_active=True
        )
    else:
        subscriptions = PushSubscription.objects.filter(user=request.user, is_active=True)

    sent = 0
    failed = 0

    for sub in subscriptions:
        try:
            payload = json.dumps({
                'title': title,
                'body': body,
                'icon': '/icons/icon-192.png',
                'badge': '/icons/icon-192.png',
                'data': {'url': '/'},
            })
            send_user_notification(
                user=sub.user,
                payload=payload,
                subscription_info={
                    'endpoint': sub.endpoint,
                    'keys': {'p256dh': sub.p256dh, 'auth': sub.auth},
                },
                ttl=10000,
            )
            sent += 1
        except WebPushException:
            sub.is_active = False
            sub.save()
            failed += 1

    # Log
    NotificationLog.objects.create(
        user=request.user,
        title=title,
        body=body,
        success=(failed == 0),
    )

    return Response({
        'sent': sent,
        'failed': failed,
        'total': subscriptions.count(),
    })
