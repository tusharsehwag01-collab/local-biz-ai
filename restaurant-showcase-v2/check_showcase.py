"""Static verification. Run: python3 restaurant-showcase-v2/check_showcase.py"""
from pathlib import Path
import json, hashlib, subprocess
from bs4 import BeautifulSoup
import html5lib, tinycss2
P=Path(__file__).parent
pages=['index','quiet-editorial','night-market','garden-table']
checks=[]
def check(condition, message):
 assert condition, message
 checks.append(message)
for name in pages:
 path=P/f'{name}.html'
 text=path.read_text()
 parser=html5lib.HTMLParser(strict=False)
 parser.parse(text)
 check(not parser.errors,f'{name}: HTML5 parses without errors')
 soup=BeautifulSoup(text,'html.parser')
 ids=[el['id'] for el in soup.select('[id]')]
 check(len(ids)==len(set(ids)),f'{name}: unique IDs')
 check(len(soup.select('h1'))==1 and len(soup.select('main'))==1,f'{name}: one main landmark and H1')
 check(soup.html['lang']=='en' and soup.select_one('meta[name="viewport"]'),f'{name}: language and viewport')
 check('Fictional restaurant concept · Sample content · No live services.' in soup.get_text(),f'{name}: visible concept disclosure')
 for el in soup.select('[href],[src]'):
  url=el.get('href',el.get('src',''))
  if url.startswith('#'):
   check(url[1:] in ids,f'{name}: anchor {url} resolves')
  else:
   check(not ':' in url and (P/url).is_file(),f'{name}: local dependency {url} exists')
 for el in soup.select('[aria-labelledby],[aria-describedby]'):
  for attr in ('aria-labelledby','aria-describedby'):
   for id_ in el.get(attr,'').split():
    check(id_ in ids,f'{name}: {attr} {id_} resolves')
 for img in soup.select('img'):
  check(bool(img.get('alt')) and img.get('width') and img.get('height') and img.get('srcset'),f'{name}: image alt, dimensions and responsive source')
 check(not soup.select('form,iframe,video,audio'),f'{name}: no submission, third-party embeds or autoplay media')
 if name!='index':
  for id_ in ['menu','hours','phone','address','requests']:
   check(bool(soup.select_one(f'.tasks a[href="#{id_}"]')),f'{name}: {id_} is directly reachable from essentials')
  check(bool(soup.select_one('dialog button.close')),f'{name}: dialog has explicit close control')
css=(P/'styles.css').read_text()
rules=tinycss2.parse_stylesheet(css,skip_comments=True,skip_whitespace=True)
check(not [x for x in rules if x.type=='error'],'CSS top-level syntax parses')
for feature in [':focus-visible','prefers-reduced-motion:reduce','text-wrap:balance']:
 check(feature in css,f'CSS: {feature} present')
check('position:fixed' not in css.replace(' ',''),'No permanent fixed overlays')
subprocess.run(['node','--check',str(P/'interactions.js')],check=True,capture_output=True)
checks.append('JavaScript syntax passes node --check')
# Guard against accidental shared skeleton regeneration.
soups={n:BeautifulSoup((P/f'{n}.html').read_text(),'html.parser') for n in pages[1:]}
check(bool(soups['quiet-editorial'].select('.editorial-menu .menu-columns')),'Quiet: open two-course editorial menu')
check(bool(soups['night-market'].select('.board [data-category]')),'Night: filterable menu board')
check(len(soups['garden-table'].select('details'))==3,'Garden: three native course accordions')
baseline=Path('/private/tmp/restaurant-v2-baseline.json')
if baseline.exists():
 original=json.loads(baseline.read_text())
 changed=[name for name,digest in original.items() if not (P.parent/name).exists() or hashlib.sha256((P.parent/name).read_bytes()).hexdigest()!=digest]
 check(not changed,f'All {len(original)} pre-existing workspace files match SHA-256 baseline')
report={'status':'PASS','checks':len(checks),'results':checks,'limitations':'Static only. See VERIFICATION.md for browser execution blockers.'}
(P/'static-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'PASS: {len(checks)} static checks. Report: {P}/static-results.json')
