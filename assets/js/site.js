(function () {
  var SITE = {
    company: '福建漳州东山渔见鲜水产有限公司',
    short: '东山渔见鲜',
    en: 'DONGSHAN ISLAND · LIVE-FROZEN SEAFOOD',
    hotline: '18150133337',
    address: '漳州市（具体地址待补充）',
    email: '253270617@qq.com',
    icp: '闽ICP备（占位）号',
    seoTitle: '东山渔见鲜',
    seoDesc: '东山岛渔船直供、电商和餐饮供货海鲜批发和零售、小船现钓、活冻锁鲜',
    navLeft: [
      { t: '首页', u: 'index.html' },
      { t: '产品中心', u: 'business.html', children: [
        ['海鲜系列', 'business.html'],
        ['渔家干货', 'business.html'],
        ['海产制品', 'business.html'],
        ['礼盒套装', 'business.html']
      ]},
      { t: '新闻中心', u: 'news.html' }
    ],
    navRight: [
      { t: '在线咨询', u: 'online.html' },
      { t: '合作伙伴', u: 'partners.html' },
      { t: '联系我们', u: 'contact.html', children: [
        ['联系方式', 'contact.html'],
        ['数字名片', 'card.html']
      ]}
    ],
    footerGroups: [
      { h: '快速导航', items: [['在线咨询', 'online.html'], ['产品中心', 'business.html'], ['新闻中心', 'news.html'], ['联系我们', 'contact.html']] },
      { h: '产品中心', items: [['海鲜系列', 'business.html'], ['渔家干货', 'business.html'], ['海产制品', 'business.html'], ['礼盒套装', 'business.html']] }
    ],
    info: [
      '📍 地址：漳州市（具体地址待补充）',
      '📞 电话：<a href="tel:18150133337">18150133337</a>',
      '✉ 邮箱：<a href="mailto:253270617@qq.com">253270617@qq.com</a>',
      '🕘 工作时间：周一至周日 8:00-20:00'
    ]
  };

  function curPage() {
    var p = location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  function isActive(page, item) {
    return item.u === page || (item.children && item.children.some(function (c) { return c[1] === page; }));
  }

  function renderDropdown(children) {
    return '<div class="dropdown">' +
      children.map(function (c) { return '<a href="' + c[1] + '">' + c[0] + '</a>'; }).join('') +
      '</div>';
  }

  function renderNavItem(item, page) {
    var act = isActive(page, item) ? ' active' : '';
    var drop = item.children ? renderDropdown(item.children) : '';
    return '<a href="' + item.u + '" class="nav-item' + act + '">' + item.t + drop + '</a>';
  }

  function renderHeader() {
    var page = curPage();
    var left = SITE.navLeft.map(function (n) { return renderNavItem(n, page); }).join('');
    var right = SITE.navRight.map(function (n) { return renderNavItem(n, page); }).join('');
    var el = document.getElementById('site-header');
    el.innerHTML =
      '<div class="container">' +
      '<nav class="nav-left">' + left + '</nav>' +
      '<a href="index.html" class="logo"><img src="assets/images/logo.png" alt="' + SITE.company + '"></a>' +
      '<nav class="nav-right">' + right + '</nav>' +
      '</div>';
  }

  function renderFooter() {
    var groups = SITE.footerGroups.map(function (g) {
      return '<div class="fcol"><h5>' + g.h + '</h5><ul>' +
        g.items.map(function (it) { return '<li><a href="' + it[1] + '">' + it[0] + '</a></li>'; }).join('') +
        '</ul></div>';
    }).join('');
    var el = document.getElementById('site-footer');
    el.innerHTML =
      '<div class="container footer-top">' +
      '<div class="fcol"><h5>' + SITE.company + '</h5>' +
      '<p style="margin:0;color:#999;max-width:320px;line-height:1.8;">' + SITE.seoDesc + '</p></div>' +
      groups +
      '<div class="fcol"><h5>联系我们</h5><ul class="footer-contact">' +
      SITE.info.map(function (i) { return '<li>' + i + '</li>'; }).join('') +
      '</ul><img src="assets/images/qrcode.png" alt="公众号二维码" style="margin-top:12px;width:100px;height:auto;border:4px solid #fff;background:#fff;border-radius:4px;"></div>' +
      '</div>' +
      '<div class="footer-bottom"><div class="container">Copyright © 2026 ' + SITE.company + ' · ' + SITE.icp + ' · <a href="#">隐私政策</a> · <a href="#">免责声明</a></div></div>';
  }

  function initBanner() {
    var b = document.querySelector('.banner');
    if (!b) return;
    var slides = b.querySelectorAll('.slide');
    var dots = b.querySelectorAll('.dots i');
    if (slides.length < 2) return;
    var i = 0;
    // 视频slide：仅当前激活的播放，其余暂停（避免多路视频同时解码）
    function syncVideos() {
      slides.forEach(function (s, idx) {
        var v = s.querySelector('video');
        if (!v) return;
        if (idx === i) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }
    function go(n) {
      slides[i].classList.remove('active');
      if (dots[i]) dots[i].classList.remove('on');
      i = n;
      slides[i].classList.add('active');
      if (dots[i]) dots[i].classList.add('on');
      syncVideos();
    }
    setInterval(function () { go((i + 1) % slides.length); }, 4000);
    syncVideos();
  }

  function initSubTabs() {
    var tabs = document.querySelectorAll('.sub-nav-tabs a');
    var panels = document.querySelectorAll('.sub-content');
    if (!tabs.length) return;

    var hash = location.hash.replace('#', '');

    function switchTo(id) {
      tabs.forEach(function (a) { a.classList.toggle('active', a.dataset.tab === id); });
      panels.forEach(function (p) { p.classList.toggle('active', p.id === id); });
    }

    tabs.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        switchTo(a.dataset.tab);
        history.replaceState(null, null, '#' + a.dataset.tab);
      });
    });

    var valid = Array.from(panels).some(function (p) { return p.id === hash; });
    switchTo(valid ? hash : tabs[0].dataset.tab);
  }

  function initBizMenu() {
    var toggles = document.querySelectorAll('.cat-toggle');
    var details = document.querySelectorAll('.biz-detail');
    var items = document.querySelectorAll('.cat-items a');
    if (!toggles.length) return;

    var hash = location.hash.replace('#', '');

    function switchDetail(id) {
      details.forEach(function (d) { d.classList.toggle('active', d.id === id); });
      items.forEach(function (a) { a.classList.toggle('active', a.dataset.id === id); });
      toggles.forEach(function (t) {
        var parent = t.closest('.biz-cat');
        var hasActive = parent.querySelector('[data-id="' + id + '"]');
        parent.classList.toggle('open', !!hasActive);
        t.classList.toggle('active', !!hasActive);
      });
    }

    toggles.forEach(function (t) {
      t.addEventListener('click', function () {
        var cat = t.closest('.biz-cat');
        cat.classList.toggle('open');
      });
    });

    items.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var id = a.dataset.id;
        switchDetail(id);
        history.replaceState(null, null, '#' + id);
      });
    });

    var first = items[0] ? items[0].dataset.id : '';
    var valid = Array.from(details).some(function (d) { return d.id === hash; });
    switchDetail(valid ? hash : first);
  }

  function initContactForm() {
    var f = document.getElementById('contact-form');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = document.getElementById('form-ok');
      if (ok) ok.style.display = 'block';
      f.reset();
    });
  }

  function initCardSearch() {
    var input = document.getElementById('card-search-input');
    if (!input) return;
    input.addEventListener('input', function () {
      var kw = input.value.trim().toLowerCase();
      document.querySelectorAll('.card-item').forEach(function (card) {
        var name = card.dataset.name || '';
        card.style.display = name.indexOf(kw) >= 0 ? '' : 'none';
      });
    });
  }

  /* 从 assets/js/products.js 的产品清单生成左侧菜单与右侧详情区 */
  function renderProducts() {
    var menu = document.querySelector('.biz-menu');
    var main = document.querySelector('.biz-main');
    var list = window.PRODUCTS;
    if (!menu || !main || !list || !list.length) return;

    var BAD = ['/', ':', '*', '?', '"', '<', '>', '|'];

    function esc(v) {
      return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function safe(v) {
      var out = String(v);
      BAD.forEach(function (c) { out = out.split(c).join(''); });
      return out;
    }

    var menuHtml = '';
    var mainHtml = '';

    list.forEach(function (cat, ci) {
      var cName = safe(cat.cat);
      var itemsHtml = '';
      (cat.items || []).forEach(function (p) {
        var fName = p.folder || safe(p.name);
        var folder = 'assets/products/' + cName + '/' + fName;
        itemsHtml += '<a href="#' + esc(p.id) + '" data-id="' + esc(p.id) + '">' + esc(p.name) + '</a>';
        mainHtml += '<div class="biz-detail" id="' + esc(p.id) + '">'
          + '<h2>' + esc(p.name) + '</h2>'
          + '<p>' + esc(p.desc || '') + '</p>'
          + '<div class="tags">'
          + (p.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('')
          + '</div>'
          + '<div class="gallery" data-folder="' + esc(folder) + '">'
          + '<div class="g-track"></div>'
          + '</div>'
          + '</div>';
      });
      menuHtml += '<div class="biz-cat' + (ci === 0 ? ' open' : '') + '">'
        + '<div class="cat-toggle' + (ci === 0 ? ' active' : '') + '">' + esc(cat.cat) + ' <span class="arrow">▼</span></div>'
        + '<div class="cat-items">' + itemsHtml + '</div>'
        + '</div>';
    });

    menu.innerHTML = menuHtml;
    main.innerHTML = mainHtml;
  }

  /* 产品详情图：淘宝式纵向平铺，顺序读取 data-folder 内 01/02/03... 图片 */
  function initProductGallery() {
    var galleries = document.querySelectorAll('.gallery');
    if (!galleries.length) return;

    var lb, lbImg;
    function ensureLightbox() {
      if (lb) return;
      lb = document.createElement('div');
      lb.className = 'img-lightbox';
      lbImg = document.createElement('img');
      lb.appendChild(lbImg);
      document.body.appendChild(lb);
      lb.addEventListener('click', function () { lb.classList.remove('on'); });
    }

    galleries.forEach(function (gal) {
      var folder = gal.getAttribute('data-folder') || '';
      var track = gal.querySelector('.g-track');
      if (!track) return;
      var exts = ['jpg', 'jpeg', 'png', 'webp'];
      var MAX = 99;              /* 上限 99 张；序号连续，遇断号即停 */
      var count = 0;
      var done = false;

      function addImg(src) {
        var img = document.createElement('img');
        img.alt = '';
        img.loading = 'lazy';
        img.src = src;
        img.addEventListener('click', function () {
          ensureLightbox();
          lbImg.src = src;
          lb.classList.add('on');
        });
        track.appendChild(img);
        count++;
      }
      function finish() {
        if (done) return;
        done = true;
        if (!count) {
          var e = document.createElement('div');
          e.className = 'g-empty';
          e.textContent = '该产品暂无图片，请在对应文件夹放入 01.jpg 等图片';
          track.appendChild(e);
        }
      }
      function tryExt(num, ei) {
        if (done) return;
        if (num > MAX || ei >= exts.length) { finish(); return; }
        var url = folder + '/' + ('0' + num).slice(-2) + '.' + exts[ei];
        var im = new Image();
        im.onload = function () {
          if (done) return;
          addImg(url);
          tryExt(num + 1, 0);
        };
        im.onerror = function () { if (!done) tryExt(num, ei + 1); };
        im.src = url;
      }
      tryExt(1, 0);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderHeader();
    renderFooter();
    initBanner();
    initSubTabs();
    renderProducts();
    initBizMenu();
    initContactForm();
    initCardSearch();
    initProductGallery();
  });
})();
