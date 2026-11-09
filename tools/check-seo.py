#!/usr/bin/env python3
"""Check static SEO contracts without dependencies. Run: python3 tools/check-seo.py."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
BASE='https://bizguide.website/'
class Page(HTMLParser):
 def __init__(self,path):
  super().__init__();self.path=path;self.source=path.read_text();self.tags=[];self.ids=[];self.feed(self.source)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append((tag,a))
  if 'id' in a:self.ids.append(a['id'])
 def meta(self,key,kind='name'):return [a.get('content') for t,a in self.tags if t=='meta' and a.get(kind)==key]
 def canonical(self):return [a.get('href') for t,a in self.tags if t=='link' and a.get('rel')=='canonical']
pages={p.name:Page(p) for p in ROOT.glob('*.html')};titles=[];descriptions=[];errors=[];urls=[];breadcrumb_count=0;articles=0
for name,p in pages.items():
 def check(ok,msg):
  if not ok:errors.append(name+': '+msg)
 check(len(p.ids)==len(set(p.ids)),'duplicate IDs');check(sum(t=='h1' for t,a in p.tags)==1,'expected one H1')
 for t,a in p.tags:
  value=a.get('href',a.get('src',''));u=urlsplit(value)
  if not value or u.scheme or u.netloc:continue
  target=unquote(u.path).lstrip('/') or name
  check((ROOT/target).exists(),'missing file '+target)
  if u.fragment and target in pages:check(unquote(u.fragment) in pages[target].ids,'missing fragment '+value)
 if name=='404.html':
  check(p.meta('robots')==['noindex'],'404 must stay noindex');check(not p.canonical(),'404 must not claim a canonical page');continue
 url=BASE if name=='index.html' else BASE+name;urls.append(url)
 check(p.canonical()==[url],'canonical mismatch');check(p.meta('robots')==['index,follow,max-image-preview:large'],'unexpected robots')
 title=re.findall('<title>(.*?)</title>',p.source);check(len(title)==1,'title count');titles+=title
 description=p.meta('description');check(len(description)==1 and bool(description[0]),'description count');descriptions+=description
 check(p.meta('og:url','property')==[url],'Open Graph URL mismatch');check(p.meta('og:image','property')==[BASE+'social-preview.png'],'preview image missing')
 graphs=[json.loads(s) for s in re.findall('<script type="application/ld\\+json">(.*?)</script>',p.source)]
 check(len(graphs)==1,'expected one structured data graph');graph=graphs[0]['@graph'];nodes={n['@type']:n for n in graph}
 if name=='index.html':check('WebSite' in nodes and 'Organization' in nodes,'site identity missing')
 else:
  check('BreadcrumbList' in nodes,'breadcrumb schema missing');check(any(t=='nav' and a.get('aria-label')=='Breadcrumb' for t,a in p.tags),'visible breadcrumb missing');breadcrumb_count+=1
  for i,item in enumerate(nodes['BreadcrumbList']['itemListElement']):
   check(item['position']==i+1 and item['item'] in [BASE]+[BASE+n for n in pages if n!='index.html'],'invalid breadcrumb item')
 if name.startswith('blog-'):
  articles+=1;article=nodes.get('BlogPosting',{});check(bool(article.get('headline')) and bool(article.get('datePublished')),'incomplete article schema')
check_unique=lambda vals,label: errors.append('Duplicate '+label) if len(vals)!=len(set(vals)) else None
check_unique(titles,'titles');check_unique(descriptions,'descriptions')
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'};sitemap=ET.parse(ROOT/'sitemap.xml');mapped=[x.text for x in sitemap.findall('s:url/s:loc',ns)]
if len(mapped)!=len(set(mapped)) or set(mapped)!=set(urls):errors.append('Sitemap must exactly match canonical indexable pages')
feed=ET.parse(ROOT/'feed.xml')
if len(feed.findall('./channel/item'))!=articles:errors.append('RSS and article count differ')
robots=(ROOT/'robots.txt').read_text()
if 'Sitemap: '+BASE+'sitemap.xml' not in robots:errors.append('Missing sitemap in robots.txt')
# The public directory must cover every indexable page except itself and home.
directory=pages['sitemap.html'];links={a['href'] for t,a in directory.tags if t=='a' and 'href' in a}
for name in pages:
 if name not in ['404.html','index.html','sitemap.html'] and name not in links:errors.append('Directory omits '+name)
print(json.dumps({'html_pages':len(pages),'indexable_pages':len(urls),'articles':articles,'breadcrumb_pages':breadcrumb_count,'sitemap_urls':len(mapped),'errors':errors},indent=2))
raise SystemExit(bool(errors))
