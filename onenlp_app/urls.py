from django.urls import path, include
from . import views
from django.contrib.auth.decorators import login_required
from django.contrib import admin

admin.autodiscover()
admin.site.login = login_required(admin.site.login)


app_name = 'onenlp_app'


urlpatterns = [
    path("", include("django.contrib.auth.urls")),
    path("", include("social_django.urls", namespace='social')),

    path('', views.HomeView.as_view(), name='home'),
    path("logout", views.Logout.as_view(), name = 'logout'),
    path("dashboard", views.Dashboard.as_view(), name= 'dashboard'),



    path('update', views.Update.as_view(), name = 'update'),
    path('delete', views.Delete.as_view(), name = 'delete'),
    path('api/segment', views.Segmentor.as_view(), name='segmentor'),
    path('api/summary', views.Summary.as_view(), name="summary"),
    path('api/sentencer', views.Sentencer.as_view(), name="sentencer"),
    path('api/dependency', views.Dependency.as_view(), name="dependency"),
    path('api/sentiment', views.Sentiment_Analysis.as_view(), name="sentiment"),
    path('api/phraseMatcher', views.PhraseMatcher.as_view(), name="phraseMatcher"),
    path('api/opposite', views.OppositeWord.as_view(), name="opposite"),
    path('api/usage', views.UsageOfWord.as_view(), name="usage"),
    path('aboutus', views.Aboutus.as_view(), name="aboutus"),

]