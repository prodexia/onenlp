from django.shortcuts import (
    render,
    redirect,
    get_object_or_404
)
from django.views import View
from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
from django.conf import settings
from django.views.generic import FormView
from django.urls import reverse
import json 
from urllib.parse import urlencode
from .onenlp import OneNLP
from core.settings import LOGIN_URL
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout as log_out
from .models import Snippets




class HomeView(View):
    def get(self, request):
        context = {}
        if request.GET.get('title'):
            context['title'] = request.GET.get('title')
            context['content'] = request.GET.get('content')

        context['login_url'] = LOGIN_URL
        return render(request, 'home.html', context)


class Logout(View):
    def get(self, request):
        log_out(request)
        return_to = urlencode({"returnTo": request.build_absolute_uri("/")})
        logout_url = "https://{}/v2/logout?client_id={}&{}".format(
            settings.SOCIAL_AUTH_AUTH0_DOMAIN, settings.SOCIAL_AUTH_AUTH0_KEY, return_to,
        )
        return HttpResponseRedirect(logout_url)


class AboutUs(View):
    template = "aboutus.html"
    def get(self, request):
        context = {}
        return render(self.request, self.template , context)


class Dashboard(View):
    @method_decorator(login_required)
    def get(self, request):
        snippets = Snippets.objects.filter(author = request.user)

        print(request.user)
        context = {
            'snippets': snippets,
            'page_title': 'dashboard'
        }
        return render(self.request, 'dashboard.html', context)


class Update(View):
    @method_decorator(login_required)
    def post(self, request):
        if request.method=='POST':
            raw = json.loads(request.body)

            try:
                obj = Snippets.objects.get(title = raw.get('title'))
                if raw.get('content') != None:
                    obj.content = raw.get('content')
                if raw.get('title') != None:
                    obj.title = raw.get('title')
                obj.author = str(request.user)
                obj.save()
            except Snippets.DoesNotExist:
                obj = Snippets(title = raw.get('title'), content = raw.get('content'), author =str(request.user))
                obj.save()            

            return JsonResponse({'status':'Success', 'msg': 'save successfully'})
        else:
            return JsonResponse({'status':'Fail', 'msg':'Not a valid request'})


class Delete(View):
    @method_decorator(login_required)
    def post(self, request):
        title = json.loads(request.body.decode("utf-8"))["link"] 
        snipp = get_object_or_404(Snippets, title = title)
        try:
            snipp.delete()
            return JsonResponse({"success": "Snippet is successfully deleted!" })
        except:
            return JsonResponse({"error": "Oops! Some error occured."})


class Features(View):
    def get(self, request):
        return render(request, 'features.html')


class Aboutus(View):
    def get(self, request):
        return render(request, 'aboutus.html')


class Segmentor(View):
    def get(self, request):
        text = request.GET.get('text')

        nlps = OneNLP()
        response = json.loads(nlps.build(text))
        context = json.loads(nlps.process_props(text))
        sents = json.loads(nlps.get_sentences(text))

        params = {
            "message": "synonyms-net formed successfully!",
            "code": "api-v1",
            "sentences": sents["sentences"],
            "sent_count": sents["sent_count"],
            "data": response['data'],
            "mcw": context["mcw"],
            "pos": context["pos"],
            "summary": context["summary"],
            "status": 200
        }
        return JsonResponse(params)

class Dependency(View):
    def get(self ,request):
        text = request.GET.get('text')

        nlps = OneNLP()
        response = json.loads(nlps.dependency_visualizer(text))
        params = {
            "dependency": response["dependency"]
        }
        return JsonResponse(params)

class Sentencer(View):
    def get(self, request):
        text = request.GET.get('text')

        nlps = OneNLP()
        response = json.loads(nlps.get_sentences(text))
        params = {
            "sentences": response["sentences"]
        }
        return JsonResponse(params)

class Summary(View):
    def get(self, request):
        text = request.GET.get('text')

        nlps = OneNLP()
        response = json.loads(nlps.generate_summary(text))
        params = {
            "summary": response["summary"]
        }
        return JsonResponse(params)

class Sentiment_Analysis(View):
    def get(self, request):
        text = request.GET.get('text')

        nlps = OneNLP()
        response = json.loads(nlps.sentiment_analysis(text))
        params = {
            "sentiment": response["sentiment"]
        }
        return JsonResponse(params)

class PhraseMatcher(View):
    def get(self, request):
        text = request.GET.get('text')
        patterns = request.GET.get('patterns')

        nlps = OneNLP()
        response = json.loads(nlps.phrase_matcher(text, patterns))
        params = {
            "matched_phrases": response["matched_phrases"]
        }
        return JsonResponse(params)

class OppositeWord(View):
    def get(self, request):
        text = request.GET.get('text')

        nlps = OneNLP()
        response = json.loads(nlps.oppositeWord(text))
        params = {
            "antonyms": response["antonyms"]
        }
        return JsonResponse(params)

class UsageOfWord(View):
    def get(self, request):
        text = request.GET.get('text')

        nlps = OneNLP()
        response = json.loads(nlps.usageOfWord(text))
        params = {
            "definitions": response["definitions"]
        }
        return JsonResponse(params)