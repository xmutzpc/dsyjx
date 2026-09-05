# -*- coding: utf-8 -*-
"""把 Word 发布稿(docx) 转换为网站新闻中心的 HTML 片段，图片提取为静态资源。
用法: python _docx_to_news.py <docx路径> <新闻编号 如 04>
输出:
  assets/news/<id>.html           正文片段(注入新闻详情容器)
  assets/news/images/<id>_*.png   图片静态资源
  assets/news/<id>.json           元信息(自动写)
  news-index.json 自动追加一项
"""
import sys, os, re, json, zipfile, shutil
import xml.etree.ElementTree as ET

W  = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R  = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
A  = 'http://schemas.openxmlformats.org/drawingml/2006/main'
REL= 'http://schemas.openxmlformats.org/package/2006/relationships'

def q(tag, ns=W): return '{%s}%s' % (ns, tag)

docx = sys.argv[1]
nid  = sys.argv[2] if len(sys.argv) > 2 else '04'
base = os.path.dirname(os.path.abspath(__file__))
news_dir = os.path.join(base, 'assets', 'news')
img_dir  = os.path.join(news_dir, 'images')
os.makedirs(img_dir, exist_ok=True)

z = zipfile.ZipFile(docx)
# 关系映射 rId -> Target
rels_xml = z.read('word/_rels/document.xml.rels').decode('utf-8')
rels_root = ET.fromstring(rels_xml)
rid2target = {}
for rel in rels_root:
    rid = rel.get('Id')
    tgt = rel.get('Target')
    if tgt and (tgt.startswith('media/') or '/media/' in tgt):
        rid2target[rid] = tgt.replace('media/', '').lstrip('/')

doc = ET.fromstring(z.read('word/document.xml'))
body = doc.find(q('body'))

def para_text(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))

def para_runs(p):
    """返回带粗体/斜体的片段列表"""
    out = []
    for r in p.iter(q('r')):
        txt = ''.join(t.text or '' for t in r.iter(q('t')))
        if not txt:
            continue
        rpr = r.find(q('rPr'))
        bold = ital = False
        if rpr is not None:
            if rpr.find(q('b')) is not None: bold = True
            if rpr.find(q('i')) is not None: ital = True
        seg = txt
        if bold: seg = '<strong>' + seg + '</strong>'
        if ital: seg = '<em>' + seg + '</em>'
        out.append(seg)
    return ''.join(out)

def para_style(p):
    ppr = p.find(q('pPr'))
    if ppr is None: return None
    ps = ppr.find(q('pStyle'))
    if ps is None: return None
    return ps.get(q('val'))

def esc(s):
    return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def find_images(p):
    """返回该段落内的图片 (rId -> 文件名) 列表。w:drawing 在 wordprocessingml(W) 命名空间"""
    res = []
    for drawing in p.iter(q('drawing', W)):
        blip = drawing.find('.//' + q('blip', A))
        if blip is None:
            continue
        rid = blip.get(q('embed', R))
        if rid and rid in rid2target:
            res.append(rid2target[rid])
    return res

def render_para(p):
    style = para_style(p)
    text = para_runs(p)
    imgs = find_images(p)
    # 标题映射
    if style:
        if style == 'Title':
            tag = 'h1'
        elif style.startswith('Heading'):
            try: lvl = int(style[len('Heading'):])
            except: lvl = 1
            tag = 'h' + str(min(max(lvl,1),4))
        else:
            tag = 'p'
    else:
        tag = 'p'
    html = ''
    if text.strip():
        html += '<%s>%s</%s>' % (tag, text, tag)
    for im in imgs:
        src_path = 'word/media/' + im
        ext = os.path.splitext(im)[1] or '.png'
        out_name = '%s_%s' % (nid, im.split('/')[-1])
        out_path = os.path.join(img_dir, out_name)
        with open(out_path, 'wb') as f:
            f.write(z.read(src_path))
        rel = 'assets/news/images/' + out_name
        html += '<img src="%s" alt="">' % rel
    return html

def render_cell(tc):
    # 单元格内可能有多个段落
    parts = []
    for p in tc.findall(q('p')):
        parts.append(render_para(p))
    return '<td>' + ''.join(parts) + '</td>'

def render_tbl(tbl):
    rows = []
    for tr in tbl.findall(q('tr')):
        cells = [render_cell(tc) for tc in tr.findall(q('tc'))]
        rows.append('<tr>' + ''.join(cells) + '</tr>')
    return '<table><tbody>' + ''.join(rows) + '</table>'

# 主转换：按 body 子元素顺序
fragments = []
title_candidate = None
for el in body:
    tag = el.tag
    if tag == q('p'):
        frag = render_para(el)
        if frag:
            if title_candidate is None:
                m = re.sub('<[^>]+>', '', frag).strip()
                if m:
                    title_candidate = m
            fragments.append(frag)
    elif tag == q('tbl'):
        fragments.append(render_tbl(el))

html_body = '\n'.join(fragments)
html_file = os.path.join(news_dir, nid + '.html')
with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html_body + '\n')

# 元信息
title = title_candidate or ('新闻 %s' % nid)
plain = re.sub('<[^>]+>', '', html_body).strip()
# 摘要：取正文里第一个像样的段落（跳过标题/GEO/推荐标题等元信息块）
paras = re.findall(r'<p>(.*?)</p>', html_body, re.S)
summary = ''
for pp in paras:
    txt = re.sub('<[^>]+>', '', pp).strip()
    if len(txt) < 12:
        continue
    if '推荐标题' in txt or '发布稿' in txt or 'GEO' in txt:
        continue
    if re.match(r'^\d+[.、]\s', txt):   # 跳过推荐标题列表项（1. 2. …）
        continue
    summary = txt
    break
if not summary:
    summary = plain[:60]
summary = summary[:60] + ('…' if len(summary) >= 60 else '')
# 尝试抓日期
mdate = re.search(r'(\d{4})\s*[-年./]\s*(\d{1,2})\s*[-月./]\s*(\d{1,2})', plain)
date = mdate.group(0).replace('年','-').replace('月','-').replace('日','').replace('/','-').replace('.','-') if mdate else '2026-09-05'
# 规范化日期
md = re.match(r'(\d{4})-(\d{1,2})-(\d{1,2})', date)
if md:
    date = '%s-%02d-%02d' % (int(md.group(1)), int(md.group(2)), int(md.group(3)))

meta = {'id': nid, 'title': title, 'date': date, 'summary': summary, 'cover': ''}
json_file = os.path.join(news_dir, nid + '.json')
with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)
    f.write('\n')

# 追加到 news-index.json
idx_path = os.path.join(news_dir, 'news-index.json')
idx = json.load(open(idx_path, encoding='utf-8'))
if not any(x.get('id') == nid for x in idx):
    idx.append({'id': nid, 'title': title, 'date': date, 'summary': summary})
    json.dump(idx, open(idx_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    idx_note = '已追加到 news-index.json'
else:
    idx_note = 'news-index.json 已存在该项，跳过'

print('=== 转换完成 ===')
print('标题:', title)
print('日期:', date)
print('摘要:', summary)
print('图片已提取到:', img_dir)
for f in sorted(os.listdir(img_dir)):
    if f.startswith(nid + '_'):
        print('   ', f)
print('正文片段:', html_file, '(%d 字符)' % len(html_body))
print(idx_note)
