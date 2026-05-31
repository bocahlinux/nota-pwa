from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from notes.models import Nota, Tag, Attachment
import json


def _get_access_token(user):
    return str(RefreshToken.for_user(user).access_token)


class AuthTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123', email='test@example.com')

    def test_register_success(self):
        resp = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)
        self.assertEqual(resp.data['user']['username'], 'newuser')

    def test_register_duplicate_username(self):
        resp = self.client.post('/api/auth/register/', {
            'username': 'testuser',
            'email': 'other@example.com',
            'password': 'pass12345',
            'password_confirm': 'pass12345',
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        resp = self.client.post('/api/auth/register/', {
            'username': 'otheruser',
            'email': 'other@example.com',
            'password': 'pass12345',
            'password_confirm': 'different',
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        resp = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)

    def test_login_invalid_credentials(self):
        resp = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'wrongpass',
        })
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        refresh = RefreshToken.for_user(self.user)
        access = _get_access_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access)
        resp = self.client.post('/api/auth/logout/', {'refresh': str(refresh)})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_me_endpoint(self):
        access = _get_access_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access)
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['username'], 'testuser')

    def test_protected_endpoint_without_auth(self):
        resp = self.client.get('/api/notas/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        refresh = RefreshToken.for_user(self.user)
        resp = self.client.post('/api/auth/refresh/', {'refresh': str(refresh)})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)


class NotaTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.user2 = User.objects.create_user(username='otheruser', password='otherpass123')
        self._auth(self.user)
        self.nota1 = Nota.objects.create(title='First Note', content='Hello world', author=self.user, status='published')
        self.nota2 = Nota.objects.create(title='Draft Note', content='Draft content', author=self.user, status='draft')
        Nota.objects.create(title='Other Note', content='Not mine', author=self.user2)

    def _auth(self, user):
        access = _get_access_token(user)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access)

    def test_list_notas(self):
        resp = self.client.get('/api/notas/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 2)

    def test_create_nota(self):
        resp = self.client.post('/api/notas/', {
            'title': 'New Note',
            'content': 'New content',
            'status': 'draft',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['title'], 'New Note')
        self.assertEqual(resp.data['author_username'], 'testuser')

    def test_create_nota_with_tags(self):
        tag1 = Tag.objects.create(name='work', user=self.user)
        tag2 = Tag.objects.create(name='urgent', user=self.user)
        resp = self.client.post('/api/notas/', {
            'title': 'Tagged Note',
            'content': 'Has tags',
            'tag_ids': [tag1.id, tag2.id],
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(resp.data['tags']), 2)

    def test_update_nota(self):
        resp = self.client.patch('/api/notas/' + str(self.nota1.id) + '/', {'title': 'Updated Title'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.nota1.refresh_from_db()
        self.assertEqual(self.nota1.title, 'Updated Title')

    def test_delete_nota(self):
        resp = self.client.delete('/api/notas/' + str(self.nota1.id) + '/')
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Nota.objects.filter(id=self.nota1.id).exists())

    def test_user_cannot_access_other_user_nota(self):
        other_nota = Nota.objects.get(title='Other Note')
        resp = self.client.get('/api/notas/' + str(other_nota.id) + '/')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_toggle_pin(self):
        resp = self.client.post('/api/notas/' + str(self.nota1.id) + '/toggle_pin/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['is_pinned'])

    def test_archive(self):
        resp = self.client.post('/api/notas/' + str(self.nota1.id) + '/archive/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.nota1.refresh_from_db()
        self.assertEqual(self.nota1.status, 'archived')

    def test_search_nota(self):
        resp = self.client.get('/api/notas/', {'search': 'First'})
        self.assertEqual(resp.data['count'], 1)
        self.assertEqual(resp.data['results'][0]['title'], 'First Note')

    def test_stats(self):
        resp = self.client.get('/api/notas/stats/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['total'], 2)
        self.assertEqual(resp.data['published'], 1)
        self.assertEqual(resp.data['draft'], 1)

    def test_export(self):
        resp = self.client.get('/api/notas/export/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = json.loads(resp.content)
        self.assertEqual(data['count'], 2)

    def test_import(self):
        payload = {
            'notas': [
                {'title': 'Imported 1', 'content': 'Content 1', 'tags': [{'name': 'imported', 'color': '#ff0000'}]},
                {'title': 'Imported 2', 'content': 'Content 2'},
            ]
        }
        resp = self.client.post('/api/notas/import_notes/', payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['imported'], 2)

    def test_filter_by_tag(self):
        tag = Tag.objects.create(name='important', user=self.user)
        self.nota1.tags.add(tag)
        resp = self.client.get('/api/notas/', {'tag': 'important'})
        self.assertEqual(resp.data['count'], 1)

    def test_ordering(self):
        resp = self.client.get('/api/notas/', {'ordering': 'title'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


class TagTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.user2 = User.objects.create_user(username='otheruser', password='otherpass123')
        self._auth(self.user)

    def _auth(self, user):
        access = _get_access_token(user)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access)

    def test_create_tag(self):
        resp = self.client.post('/api/tags/', {'name': 'work', 'color': '#3b82f6'})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['name'], 'work')

    def test_list_tags(self):
        Tag.objects.create(name='work', user=self.user)
        Tag.objects.create(name='personal', user=self.user)
        Tag.objects.create(name='secret', user=self.user2)
        resp = self.client.get('/api/tags/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 2)

    def test_duplicate_tag_rejected(self):
        Tag.objects.create(name='work', user=self.user)
        resp = self.client.post('/api/tags/', {'name': 'work', 'color': '#ff0000'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_tag(self):
        tag = Tag.objects.create(name='temp', user=self.user)
        resp = self.client.delete('/api/tags/' + str(tag.id) + '/')
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
