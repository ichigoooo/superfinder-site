/* ============================================================
   SuperFinder site: the hero IS the app.
   Interactive window replica. Truth: ui-truth-report.md.
   Vanilla JS, zero deps. All UI chrome in English (promo baseline).
   ============================================================ */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= demo filesystem ================= */
  var PHOTO_DIR = "assets/img/photos/";
  var PHOTOS = [
    ["DSC_4027.jpg", "glacier-lagoon", "12.4 MB", "Sep 14, 2026 10:02"],
    ["DSC_4188.jpg", "aurora",         "9.1 MB",  "Sep 14, 2026 23:47"],
    ["DSC_4231.jpg", "black-beach",    "11.8 MB", "Sep 15, 2026 06:12"],
    ["DSC_4302.jpg", "waterfall",      "10.6 MB", "Sep 15, 2026 14:30"],
    ["DSC_4476.jpg", "basalt-cave",    "13.2 MB", "Sep 16, 2026 09:05"],
    ["DSC_4519.jpg", "puffin",         "8.7 MB",  "Sep 16, 2026 16:44"],
    ["DSC_4603.jpg", "blue-lagoon",    "9.9 MB",  "Sep 17, 2026 11:21"],
    ["DSC_4670.jpg", "ring-road",      "14.3 MB", "Sep 17, 2026 18:02"]
  ];
  function dir(kids) { return { t: "d", kids: kids }; }
  function file(size, kind, mtime, img) { return { t: "f", size: size, kind: kind, mtime: mtime, img: img || null }; }

  var FS = {
    "~": dir(["Pictures", "Documents", "Desktop", "Downloads"]),
    "~/Pictures": dir(["Photos", "Screenshots", "Wallpaper.png"]),
    "~/Pictures/Screenshots": dir(["Screenshot 2026-09-30.png", "Screenshot 2026-10-01.png"]),
    "~/Pictures/Wallpaper.png": file("2.8 MB", "PNG Image", "Aug 2, 2026", null),
    "~/Pictures/Screenshot 2026-09-30.png": file("1.9 MB", "PNG Image", "Sep 30, 2026", null),
    "~/Pictures/Screenshot 2026-10-01.png": file("2.2 MB", "PNG Image", "Oct 1, 2026", null),
    "~/Pictures/Photos": dir(["2026-iceland", "2025-archive", "iceland-4519.jpg"]),
    "~/Pictures/Photos/2025-archive": dir(["DSC_3101.jpg", "DSC_3102.jpg"]),
    "~/Pictures/Photos/2025-archive/DSC_3101.jpg": file("9.4 MB", "JPEG Image", "Jul 3, 2025", PHOTO_DIR + "ring-road.jpg"),
    "~/Pictures/Photos/2025-archive/DSC_3102.jpg": file("8.8 MB", "JPEG Image", "Jul 3, 2025", PHOTO_DIR + "waterfall.jpg"),
    "~/Pictures/Photos/iceland-4519.jpg": file("8.2 MB", "JPEG Image", "Aug 20, 2025", PHOTO_DIR + "puffin.jpg"),
    "~/Documents": dir(["Contracts", "launch-notes.md", "Budget 2026.numbers"]),
    "~/Documents/Contracts": dir(["NDA-scan.pdf", "Sponsor-deal.pdf"]),
    "~/Documents/Contracts/NDA-scan.pdf": file("1.1 MB", "PDF Document", "Sep 1, 2026"),
    "~/Documents/Contracts/Sponsor-deal.pdf": file("840 KB", "PDF Document", "Sep 18, 2026"),
    "~/Documents/launch-notes.md": file("18 KB", "Markdown Text", "Oct 1, 2026"),
    "~/Documents/Budget 2026.numbers": file("256 KB", "Numbers Spreadsheet", "Sep 20, 2026"),
    "~/Desktop": dir(["SuperFinder 1.1.0.dmg", "todo.txt", "Inbox"]),
    "~/Desktop/SuperFinder 1.1.0.dmg": file("8.4 MB", "Disk Image", "Oct 2, 2026"),
    "~/Desktop/todo.txt": file("4 KB", "Plain Text", "Oct 2, 2026"),
    "~/Desktop/Inbox": dir(["receipt-09.pdf"]),
    "~/Desktop/Inbox/receipt-09.pdf": file("320 KB", "PDF Document", "Sep 28, 2026"),
    "~/Downloads": dir(["SuperFinder_Promo_v3.mp4", "fonts.zip"]),
    "~/Downloads/SuperFinder_Promo_v3.mp4": file("3.6 MB", "MPEG-4 Movie", "Oct 2, 2026"),
    "~/Downloads/fonts.zip": file("1.2 MB", "ZIP Archive", "Sep 25, 2026")
  };
  var ICELAND = dir(PHOTOS.map(function (p) { return p[0]; }).concat(["selects", "Notes from the trip.md"]));
  FS["~/Pictures/Photos/2026-iceland"] = ICELAND;
  FS["~/Pictures/Photos/2026-iceland/selects"] = dir([]);
  FS["~/Pictures/Photos/2026-iceland/Notes from the trip.md"] = file("9 KB", "Markdown Text", "Sep 17, 2026 20:15");
  PHOTOS.forEach(function (p) {
    FS["~/Pictures/Photos/2026-iceland/" + p[0]] = file(p[2], "JPEG Image", p[3], PHOTO_DIR + p[1] + ".jpg");
  });
  FS["~/Pictures/Photos/2026-iceland"].pinned = ["DSC_4670.jpg"];

  function norm(s) { return s.replace(/～/g, "~").replace(/／/g, "/"); }
  function kidsOf(path) {
    var n = FS[path];
    if (!n || n.t !== "d") return null;
    return n.kids.map(function (k) {
      var p = path === "~" ? "~/" + k : path + "/" + k;
      return { name: k, path: p, node: FS[p] };
    });
  }
  function parentOf(path) {
    if (path === "~") return null;
    var i = path.lastIndexOf("/");
    return i <= 0 ? "~" : path.slice(0, i);
  }
  function baseName(path) { var i = path.lastIndexOf("/"); return i < 0 ? path : path.slice(i + 1); }
  function fmtKB(mb) { return mb; }
  function searchFS(q) {
    q = q.toLowerCase();
    var out = [];
    Object.keys(FS).forEach(function (p) {
      if (p === "~") return;
      var n = FS[p];
      if (n.t === "f" && n.name !== undefined) return;
      var name = baseName(p);
      if (name.toLowerCase().indexOf(q) !== -1) out.push({ name: name, path: p, node: FS[p] });
    });
    return out;
  }
  function walkDirs(path, acc) {
    var ks = kidsOf(path) || [];
    ks.forEach(function (k) {
      if (k.node.t === "d") { acc.push(k); walkDirs(k.path, acc); }
    });
    return acc;
  }

  /* ================= state ================= */
  var uid = 0;
  function nid(p) { return p + (++uid); }
  function makeLeaf(kind, place, query, view) {
    return { id: nid("l"), kind: kind || "dir", place: place || "~/Pictures/Photos/2026-iceland", query: query || "", view: view || "list", sel: [], back: [], fwd: [], galSel: 0 };
  }
  function cloneLeaf(l) {
    return { id: nid("l"), kind: l.kind, place: l.place, query: l.query, view: l.view, sel: l.sel.slice(), back: l.back.slice(), fwd: l.fwd.slice(), galSel: l.galSel || 0 };
  }
  function tabFromLeaf(leaf) {
    return { id: nid("t"), root: { leaf: leaf.id }, focus: leaf.id, leaves: (function () { var m = {}; m[leaf.id] = leaf; return m; })(), scroll: {} };
  }
  var T = {
    tabs: [], active: null,
    bookmarks: ["~/Pictures/Photos/2026-iceland", "~/Documents", "~/Downloads"],
    layouts: [],
    recent: ["~/Pictures/Photos/2026-iceland", "~/Documents"],
    closed: [],
    shelf: [], shelfOpen: false,
    editing: null, hintSel: 0, histOpen: false, findOpen: false,
    sidebarOpen: true, sbPage: null,
    undo: []
  };
  var HOME = makeLeaf("dir", "~/Pictures/Photos/2026-iceland");
  var homeTab = tabFromLeaf(HOME);
  T.tabs.push(homeTab); T.active = homeTab.id;
  /* product truth: sidebar ships open — except where the window gets too small */
  if (window.matchMedia("(max-width: 560px)").matches) T.sidebarOpen = false;

  function curTab() { return T.tabs.filter(function (t) { return t.id === T.active; })[0]; }
  function curLeaf() { var t = curTab(); return t.leaves[t.focus]; }
  function leafCount(t) { return Object.keys(t.leaves).length; }
  function eachLeaf(t, fn) { Object.keys(t.leaves).forEach(function (k) { fn(t.leaves[k]); }); }

  /* ================= icons ================= */
  function ic(name, cls) {
    var P2 = {
      folder: '<path d="M1.5 4.5a1 1 0 0 1 1-1h3.2l1.6 2h6.2a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H2.5a1 1 0 0 1-1-1v-7z"/>',
      chevL: '<path d="M10 3L5.5 8 10 13"/>',
      chevR: '<path d="M6 3l4.5 5L6 13"/>',
      chevD: '<path d="M3 6l5 4.5L13 6"/>',
      up: '<path d="M8 13V3M3.8 7.2L8 3l4.2 4.2"/>',
      clock: '<circle cx="8" cy="8" r="6.2"/><path d="M8 4.5V8l2.4 1.6"/>',
      layout: '<rect x="1.5" y="1.5" width="13" height="13" rx="1.5"/><path d="M1.5 8h13M8 8v6.5"/>',
      star: '<path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.7l-3.8 1.9.7-4.3-3.1-3 4.3-.6L8 1.8z"/>',
      copy: '<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 3.5v-.0M3.5 10.5v-6a1 1 0 0 1 1-1h6"/>',
      check: '<path d="M3 8.5l3.2 3L13 4.5"/>',
      list: '<path d="M2 4h12M2 8h12M2 12h12"/>',
      hier: '<path d="M5 2.5v4M5 6.5h8.5v3M5 6.5v3M5 9.5h3"/><circle cx="5" cy="2.5" r="1.4"/><circle cx="13.5" cy="9.5" r="1.4"/><circle cx="8" cy="9.5" r="1.4"/>',
      grid: '<rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>',
      film: '<rect x="1.5" y="3" width="13" height="10" rx="1.5"/><path d="M1.5 8h13M5.5 3v5M10.5 8v5"/>',
      plus: '<path d="M8 3v10M3 8h10"/>',
      x: '<path d="M4 4l8 8M12 4l-8 8"/>',
      doc: '<path d="M4 1.5h5L12.5 5v9.5h-8.5v-13z"/><path d="M9 1.5V5h3.5"/>',
      image: '<rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><circle cx="5.4" cy="6.4" r="1.2"/><path d="M1.5 11.5l3.5-3 3 2.5 2.5-2 4 2.8"/>',
      search: '<circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4L14 14"/>',
      house: '<path d="M2.5 7L8 2.5 13.5 7v6a1 1 0 0 1-1 1h-3V9.5h-3V14h-3a1 1 0 0 1-1-1V7z"/>',
      tray: '<path d="M2 9.5h3.6L7 12h2l1.4-2.5H14"/><rect x="2" y="2" width="12" height="11" rx="2"/>',
      cloud: '<path d="M4.5 11.5a2.8 2.8 0 0 1-.4-5.6 3.8 3.8 0 0 1 7.4-1 3 3 0 0 1-.4 6.6H4.5z"/>',
      radio: '<circle cx="4" cy="12" r="1.6"/><path d="M6.8 10.6a4 4 0 0 1 0-5.2M9.7 12.8a7.4 7.4 0 0 0 0-9.6"/>',
      drive: '<rect x="1.5" y="5" width="13" height="7" rx="1.5"/><circle cx="5" cy="8.5" r=".9"/><circle cx="8" cy="8.5" r=".9"/><path d="M11 6.8h2"/>',
      trash: '<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 8.5a1 1 0 0 0 1 .9h3.6a1 1 0 0 0 1-.9l.7-8.5"/>',
      warn: '<circle cx="8" cy="8" r="6.3"/><path d="M8 4.6v4.4M8 11.4v.1"/>',
      sidebar: '<rect x="1.5" y="1.5" width="13" height="13" rx="1.5"/><path d="M9.5 1.5v13"/>',
      resize: '<path d="M2 14L14 2M14 6.5V2H9.5M2 9.5V14h4.5"/>',
      lock: '<rect x="3.5" y="7" width="9" height="6.5" rx="1.5"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7"/>'
    };
    return '<svg class="' + (cls || "") + '" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P2[name] || "") + "</svg>";
  }
  function fileIcon(k, img, name) {
    if (img) return '<img class="f-ico" src="' + rel(img) + '" alt="">';
    if (k && k.t === "d") return ic("folder");
    var n = (name || "").toLowerCase();
    if (/\.(jpg|jpeg|png)$/.test(n)) return ic("image");
    return ic("doc");
  }
  function rel(p) {
    var base = document.body.dataset.assetbase || "";
    return base + p;
  }

  /* monogram tiles (start page) */
  var MONO = ["#FDE2E4", "#E2F0FB", "#E4F5E9", "#FFF3D6", "#EFE4F7", "#E0F4F1", "#FBE9D7", "#EAEEFA"];
  function mono(name, isDir, isSearch, isLayout) {
    if (isLayout) return '<span class="mono-ico" style="background:#EBECF0">' + ic("layout") + "</span>";
    if (isSearch) return '<span class="mono-ico" style="background:#E7F5FF">' + ic("search") + "</span>";
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
    var bg = MONO[h % MONO.length];
    if (/[\u4e00-\u9fff]/.test(name)) {
      return '<span class="mono-ico" style="background:' + bg + '">' + name.slice(0, 2) + "</span>";
    }
    return '<span class="mono-ico" style="background:' + bg + '">' + name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).map(function (w) { return w[0] || ""; }).join("").slice(0, 4) + "</span>";
  }

  /* ================= toast ================= */
  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById("apptoast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  /* ================= static chrome icons ================= */
  (function fill() {
    var map = {
      "btn-back": "chevL", "btn-fwd": "chevR", "btn-up": "up",
      "abtn-clock": "clock", "abtn-layout": "layout", "abtn-star": "star", "abtn-copy": "copy",
      "btn-sidebar": "sidebar"
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = ic(map[id]);
    });
    Array.prototype.forEach.call(document.querySelectorAll("#viewseg button"), function (b) {
      b.innerHTML = ic({ list: "list", hier: "hier", icons: "grid", gallery: "film" }[b.dataset.view]);
    });
    var places = ["cloud", "radio", "drive", "trash"];
    Array.prototype.forEach.call(document.querySelectorAll(".sbar .picon"), function (p, i) {
      p.innerHTML = ic(places[i] || "drive");
    });
  })();

  /* ================= render ================= */
  var win = document.getElementById("appwin");
  if (!win) return;

  function leafTitle(leaf) {
    if (leaf.kind === "start") return "New Tab";
    if (leaf.kind === "search") return "“" + leaf.query + "”";
    return baseName(leaf.place) || "~";
  }
  function paneNodeHTML(t, node, depth) {
    if (node.leaf) {
      var leaf = t.leaves[node.leaf];
      var focused = t.focus === node.leaf;
      var count = leafCount(t);
      return '<div class="pane' + (focused ? " focused" : "") + '" data-pane="' + leaf.id + '">' +
        '<button class="pane-x' + (focused && count > 1 ? " show" : "") + '" data-act="closepane" aria-label="Close pane">' + ic("x") + "</button>" +
        '<div class="pane-grip" data-grip="' + leaf.id + '"><i class="g-n"></i><i class="g-s"></i><i class="g-w"></i><i class="g-e"></i></div>' +
        '<div class="pane-body" data-body="' + leaf.id + '">' + leafBody(leaf) + "</div></div>";
    }
    var style = node.dir === "row" ? "flex-direction:row" : "flex-direction:column";
    return '<div class="psplit ' + node.dir + '" style="' + style + '">' +
      '<div class="psplit-a" style="flex:1">' + paneNodeHTML(t, node.a, depth + 1) + "</div>" +
      '<div class="psplit-b" style="flex:1">' + paneNodeHTML(t, node.b, depth + 1) + "</div></div>";
  }

  function leafBody(leaf) {
    if (leaf.kind === "start") return startHTML();
    if (leaf.kind === "search") return searchHTML(leaf);
    return dirHTML(leaf);
  }

  function dirHTML(leaf) {
    var ks = kidsOf(leaf.place) || [];
    var pinned = (FS[leaf.place] || {}).pinned || [];
    var sel = {};
    leaf.sel.forEach(function (p) { sel[p] = 1; });
    var view = leaf.view;
    if (view === "list") {
      var rows = "";
      var pinKids = ks.filter(function (k) { return pinned.indexOf(k.name) !== -1; });
      var rest = ks.filter(function (k) { return pinned.indexOf(k.name) === -1; });
      function row(k) {
        var s = sel[k.path] ? " sel" : "";
        var img = k.node.img ? '<img class="f-ico" src="' + rel(k.node.img) + '" alt="">' : "";
        var ico = img || fileIcon(k.node, null, k.name);
        return '<tr class="filerow' + s + '" data-path="' + esc(k.path) + '" data-type="' + k.node.t + '">' +
          '<td><span class="fname">' + ico + esc(k.name) + "</span></td>" +
          '<td class="mono-cell r">' + (k.node.t === "d" ? "—" : esc(k.node.size)) + "</td>" +
          '<td class="mono-cell">' + (k.node.t === "d" ? "Folder" : esc(k.node.kind)) + "</td>" +
          '<td class="mono-cell r">' + esc(k.node.t === "d" ? "" : k.node.mtime) + "</td></tr>";
      }
      if (pinKids.length) {
        rows += '<tr class="pinhead"><td colspan="4">Pinned</td></tr>' + pinKids.map(row).join("");
        rows += '<tr class="pinsep"><td colspan="4"></td></tr>';
      }
      rows += rest.map(row).join("");
      if (!ks.length) rows = '<tr><td colspan="4"><div class="empty-note">This folder is empty</div></td></tr>';
      return '<div class="vlist" data-panectx="' + leaf.id + '"><table><thead><tr>' +
        "<th>Name</th><th class=\"r\">Size</th><th>Kind</th><th class=\"r\">Date Modified</th>" +
        "</tr></thead><tbody>" + rows + "</tbody></table></div>";
    }
    if (view === "hier") {
      return '<div class="vhier" data-panectx="' + leaf.id + '">' + hierRows(leaf.place, 0, leaf) + "</div>";
    }
    if (view === "icons") {
      var cells = ks.map(function (k) {
        var imgTag = k.node.img ? '<img src="' + rel(k.node.img) + '" alt="" loading="lazy">' : fileIcon(k.node, null, k.name);
        return '<div class="ico-cell' + (sel[k.path] ? " sel" : "") + '" data-path="' + esc(k.path) + '" data-type="' + k.node.t + '">' + imgTag + '<span class="nm">' + esc(k.name) + "</span></div>";
      }).join("");
      return '<div class="vicons" data-panectx="' + leaf.id + '">' + (cells || '<div class="empty-note">This folder is empty</div>') + "</div>";
    }
    /* gallery */
    var photos = ks.filter(function (k) { return k.node.img; });
    var others = ks.filter(function (k) { return !k.node.img; });
    if (!photos.length) return '<div class="vgallery"><div class="vg-main"><div class="empty-note">No photos here</div></div></div>';
    var gi = Math.min(leaf.galSel || 0, photos.length - 1);
    var strip = photos.map(function (k, i) {
      return '<div class="vg-item' + (i === gi ? " sel" : "") + '" data-gal="' + i + '" data-path="' + esc(k.path) + '"><img src="' + rel(k.node.img) + '" alt="" loading="lazy"><span class="nm">' + esc(k.name) + "</span></div>";
    }).join("");
    var otherRows = others.map(function (k) {
      return '<div class="ico-cell" data-path="' + esc(k.path) + '" data-type="' + k.node.t + '">' + fileIcon(k.node, null, k.name) + '<span class="nm">' + esc(k.name) + "</span></div>";
    }).join("");
    return '<div class="vgallery" data-panectx="' + leaf.id + '">' +
      '<div class="vg-main"><img src="' + rel(photos[gi].node.img) + '" alt="' + esc(photos[gi].name) + '"></div>' +
      '<div class="vg-name">' + esc(photos[gi].name) + "</div>" +
      '<div class="vg-strip">' + strip + "</div>" + (otherRows ? '<div style="display:none">' + otherRows + "</div>" : "") + "</div>";
  }

  function hierRows(path, depth, leaf) {
    var ks = kidsOf(path) || [];
    var sel = {};
    leaf.sel.forEach(function (p) { sel[p] = 1; });
    return ks.map(function (k) {
      var isDir = k.node.t === "d";
      var hasKids = isDir && kidsOf(k.path) && kidsOf(k.path).length;
      var s = sel[k.path] ? " sel" : "";
      var row = '<div class="hier-row' + s + (isDir ? "" : " file") + '" data-path="' + esc(k.path) + '" data-type="' + k.node.t + '">' +
        '<span class="dis">' + (isDir ? ic("chevR") : "") + "</span>" +
        (k.node.img ? '<img src="' + rel(k.node.img) + '" alt="">' : fileIcon(k.node, null, k.name)) +
        "<span>" + esc(k.name) + "</span></div>";
      if (isDir && hasKids) {
        row += '<div class="hier-kids hidden" data-kids="' + esc(k.path) + '">' + hierRows(k.path, depth + 1, leaf) + "</div>";
      }
      return row;
    }).join("");
  }

  function startHTML() {
    var favs = T.bookmarks.map(function (p) {
      var n = FS[p];
      return n ? '<button class="tile" data-open="' + esc(p) + '">' + mono(baseName(p), true) + '<span class="t-name">' + esc(baseName(p)) + '</span><span class="t-path mono">' + shortPath(p) + "</span></button>" : "";
    }).join("");
    T.layouts.forEach(function (L) {
      favs += '<button class="tile" data-layout="' + esc(L.name) + '">' + mono(L.name, false, false, true) + '<span class="t-name">' + esc(L.name) + '</span><span class="t-path mono">Saved layout</span></button>';
    });
    var sugg = T.recent.slice(0, 6).map(function (p) {
      return '<button class="tile" data-open="' + esc(p) + '">' + mono(baseName(p), true) + '<span class="t-name">' + esc(baseName(p)) + '</span><span class="t-path mono">' + shortPath(p) + "</span></button>";
    }).join("");
    var closed = T.closed.slice(0, 8).map(function (c, i) {
      var names = c.names.join(" | ");
      return '<button class="recent-row" data-closed="' + i + '"><span class="dot" style="background:' + MONO[i % MONO.length] + '">' + esc((c.names[0] || "?")[0] || "?") + '</span><span class="r-name">' + esc(c.names.join(" + ")) + '</span><span class="r-path">' + esc(names) + "</span></button>";
    }).join("");
    return '<div class="startpage">' +
      (favs ? '<div class="sp-h">Favorites</div><div class="sp-grid">' + favs + "</div>" : "") +
      (sugg ? '<div class="sp-h">Suggestions</div><div class="sp-grid">' + sugg + "</div>" : "") +
      (closed ? '<div class="sp-h">Recently Closed Tabs</div>' + closed : "") +
      (!favs && !sugg && !closed ? '<div class="empty-note">No favorites yet. Click the star in the address bar to add folders you use often to Favorites.</div>' : "") +
      "</div>";
  }

  function searchHTML(leaf) {
    var rs = searchFS(leaf.query);
    var rows = rs.map(function (k) {
      return '<tr class="filerow" data-path="' + esc(k.path) + '" data-type="' + (k.node ? k.node.t : "d") + '"><td><span class="fname">' + ic("search") + " " + esc(k.name) + '</span></td>' +
        '<td class="mono-cell" colspan="3">' + esc(shortPath(parentOf(k.path) || "~")) + "</td></tr>";
    }).join("");
    return '<div class="search-scope">Search results for “' + esc(leaf.query) + '” across the workspace: ' + rs.length + " items</div>" +
      '<div class="vlist"><table><tbody>' + (rows || '<tr><td><div class="empty-note">No matching results</div></td></tr>') + "</tbody></table></div>";
  }

  function shortPath(p) {
    return p.replace(/^~/, "~");
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function crumbsHTML(leaf) {
    if (leaf.kind !== "dir") return '<button class="up-btn" disabled aria-label="Go up">' + ic("up") + '</button><span class="crumb last" style="padding-left:4px">' + (leaf.kind === "start" ? "New Tab" : "Search: " + esc(leaf.query)) + "</span>";
    var parts = leaf.place.split("/").filter(Boolean).slice(1);
    var out = '<button class="up-btn" data-act="up" ' + (leaf.place === "~" ? "disabled" : "") + ' aria-label="Go up">' + ic("up") + "</button>";
    out += '<button class="crumb" data-crumb="~">~</button>';
    var acc = "~";
    parts.forEach(function (seg, i) {
      acc = acc === "~" ? "~/" + seg : acc + "/" + seg;
      var last = i === parts.length - 1;
      out += '<span class="csep">/</span><button class="crumb' + (last ? " last" : "") + '" data-crumb="' + esc(acc) + '">' + esc(seg) + "</button>";
    });
    return out;
  }

  function render() {
    var t = curTab();
    var leaf = curLeaf();

    /* title */
    document.getElementById("wintitle").textContent = leafTitle(leaf);

    /* nav buttons */
    var upBtn = document.getElementById("btn-up");
    upBtn.disabled = !(leaf.kind === "dir" && leaf.place !== "~");
    document.getElementById("btn-back").disabled = !leaf.back.length;
    document.getElementById("btn-fwd").disabled = !leaf.fwd.length;

    /* seg */
    var segOn = leaf.kind === "dir" ? leaf.view : "";
    Array.prototype.forEach.call(document.querySelectorAll("#viewseg button"), function (b) {
      b.classList.toggle("on", b.dataset.view === segOn);
    });

    /* tabs */
    var strip = "";
    T.tabs.forEach(function (tb) {
      var tl = tb.leaves[tb.focus];
      var on = tb.id === T.active;
      var ico = tl.kind === "start" ? ic("house") : tl.kind === "search" ? ic("search") : ic("folder");
      strip += '<div class="tpill' + (on ? " on" : "") + '" data-tab="' + tb.id + '" role="tab">' +
        '<span class="t-ico">' + ico + '</span><span class="t-name">' + esc(leafTitle(tl)) + '</span>' +
        '<button class="t-close" data-close="' + tb.id + '" aria-label="Close tab">' + ic("x") + "</button></div>";
    });
    document.getElementById("tabstrip").innerHTML = strip + '<button class="tplus" id="tplus" aria-label="New tab">' + ic("plus") + "</button>";

    /* address */
    var card = document.getElementById("addrcard");
    var editing = T.editing && T.editing.leaf === leaf.id;
    card.classList.toggle("editing", !!editing);
    document.getElementById("crumbs").innerHTML = crumbsHTML(leaf);
    var input = document.getElementById("addrinput");
    if (editing) {
      if (document.activeElement !== input) { input.value = T.editing.value; }
    }
    var isDir = leaf.kind === "dir";
    document.getElementById("abtn-clock").style.display = "grid";
    var lay = document.getElementById("abtn-layout");
    lay.disabled = leaf.kind === "start" || leafCount(t) < 2;
    var star = document.getElementById("abtn-star");
    star.style.display = isDir ? "grid" : "none";
    star.classList.toggle("marked", isDir && T.bookmarks.indexOf(leaf.place) !== -1);

    /* bookmark chips */
    var chips = '<button class="bmk-new" id="bmknew" aria-label="New bookmark folder">' + ic("plus") + "</button>";
    T.bookmarks.forEach(function (p) {
      chips += '<button class="bchip" data-open="' + esc(p) + '">' + ic("folder") + esc(baseName(p)) + "</button>";
    });
    T.layouts.forEach(function (L) {
      chips += '<button class="bchip" data-layout="' + esc(L.name) + '">' + ic("layout") + esc(L.name) + "</button>";
    });
    document.getElementById("bmkbar").innerHTML = chips;

    /* panes + sidebar dock */
    var panesEl = document.getElementById("panes");
    panesEl.innerHTML = paneNodeHTML(t, t.root, 0);
    panesEl.classList.toggle("split-active", leafCount(t) >= 2);
    var wrapEl = panesEl.parentElement;
    if (wrapEl) {
      wrapEl.classList.toggle("split-active", leafCount(t) >= 2);
      wrapEl.classList.toggle("sb-open", !!T.sidebarOpen);
    }
    renderSidebar();

    /* find panel scope */
    var fps = document.getElementById("fp-scope");
    if (fps) fps.textContent = leaf.kind === "dir" ? 'Search in "' + baseName(leaf.place) + '"' : "Search the whole workspace";

    /* status bar */
    var left = "";
    if (leaf.kind === "dir") {
      var ks = kidsOf(leaf.place) || [];
      var files = leaf.sel.filter(function (p) { return FS[p] && FS[p].t === "f"; });
      if (leaf.sel.length) {
        left = leaf.sel.length + " selected";
        if (files.length) left += " · " + files.map(function (p) { return FS[p].size; }).join(" + ");
      } else {
        left = ks.length + " items" + ((FS[leaf.place] || {}).pinned ? " · " + (FS[leaf.place].pinned.length) + " pinned" : "");
      }
    } else if (leaf.kind === "search") {
      left = searchFS(leaf.query).length + " results";
    }
    document.getElementById("sb-left").textContent = left;

    /* shelf */
    var badge = document.getElementById("shelfbadge");
    badge.textContent = T.shelf.length;
    badge.classList.toggle("show", T.shelf.length > 0);
    var anchorEl = document.getElementById("shelfanchor");
    anchorEl.classList.toggle("show", !!(drag && drag.active));
    anchorEl.classList.remove("hungry");
    var collapseBtn = document.getElementById("shelfcollapse");
    if (collapseBtn) collapseBtn.hidden = !T.shelfOpen;
    var cardEl = document.getElementById("shelfcard");
    cardEl.classList.toggle("open", T.shelf.length > 0 || !!(drag && drag.active));
    if (T.shelf.length) {
      var body = "";
      if (T.shelfOpen) {
        body = '<div class="shelf-grid">' + T.shelf.map(function (p, i) {
          var n = FS[p];
          return '<div class="shelf-item" data-shelf="' + i + '">' + (n && n.img ? '<img src="' + rel(n.img) + '" alt="">' : fileIcon(n, null, baseName(p))) +
            '<span class="nm">' + esc(baseName(p)) + '</span><span class="src">' + esc(shortPath(parentOf(p) || "")) + '</span>' +
            '<button class="rm" data-rm="' + i + '" aria-label="Remove reference">' + ic("x") + "</button></div>";
        }).join("") + "</div>";
      } else {
        body = '<div class="shelf-stack" id="shelfstack" title="Click to fan out">';
        var top3 = T.shelf.slice(-3);
        top3.forEach(function (p, i) {
          var n = FS[p];
          var rot = (i % 2 ? 4 : -4);
          body += '<span class="stk" style="transform:translate(' + ((top3.length - 1 - i) * 5 - 5) + "px," + ((top3.length - 1 - i) * -4) + "px) rotate(" + ((top3.length - 1 - i) ? rot : 0) + 'deg)">' + (n && n.img ? '<img src="' + rel(n.img) + '" alt="">' : fileIcon(n, null, baseName(p))) + "</span>";
        });
        body += "</div>";
      }
      document.getElementById("shelfbody").innerHTML = body;
      document.getElementById("shelfcnt").textContent = "· " + T.shelf.length + " items";
      document.getElementById("shelfclear").disabled = false;
    } else {
      document.getElementById("shelfbody").innerHTML = '<div class="shelf-note" style="padding:12px;font-size:11px;color:var(--text-3)">Drag files here; they are only referenced, never moved.</div>';
      document.getElementById("shelfcnt").textContent = "· 0 items";
      document.getElementById("shelfclear").disabled = true;
    }

    /* history dropdown */
    var hd = document.getElementById("histdrop");
    hd.classList.toggle("open", T.histOpen);
    if (T.histOpen) {
      var h = "";
      if (leaf.back.length) {
        h += '<div class="hist-head">Back</div>' + leaf.back.slice(-6).reverse().map(function (e, i) {
          return '<div class="hist-item" data-hist="back:' + i + '">' + ic("clock") + esc(labelOf(e)) + "</div>";
        }).join("");
      }
      if (leaf.fwd.length) {
        h += '<div class="hist-head">Forward</div>' + leaf.fwd.slice(0, 6).map(function (e, i) {
          return '<div class="hist-item" data-hist="fwd:' + i + '">' + ic("clock") + esc(labelOf(e)) + "</div>";
        }).join("");
      }
      hd.innerHTML = h || '<div class="hist-head">No history</div>';
    }

    /* find panel */
    var fp = document.getElementById("findpanel");
    fp.style.display = T.findOpen ? "block" : "none";
  }
  function labelOf(e) { return e.kind === "dir" ? e.place : e.kind === "search" ? "Search: " + e.query : "New Tab"; }
  function entryOf(leaf) { return { kind: leaf.kind, place: leaf.place, query: leaf.query }; }

  /* ================= navigation ================= */
  function goLeaf(leaf, entry, push) {
    if (push) { leaf.back.push(entryOf(leaf)); leaf.fwd = []; }
    leaf.kind = entry.kind; leaf.place = entry.place || leaf.place; leaf.query = entry.query || "";
    leaf.sel = []; leaf.galSel = 0;
    if (leaf.kind === "dir" && T.recent[0] !== leaf.place) {
      T.recent = [leaf.place].concat(T.recent.filter(function (p) { return p !== leaf.place; })).slice(0, 8);
    }
    render();
  }
  function navTo(path) {
    var leaf = curLeaf();
    if (!FS[path] || FS[path].t !== "d") return;
    goLeaf(leaf, { kind: "dir", place: path }, true);
    closeOverlays();
  }

  /* ================= overlays ================= */
  function closeOverlays() {
    T.histOpen = false; T.findOpen = false;
    var m = document.getElementById("ctxmenu");
    if (m) m.classList.remove("open");
    var hm = document.getElementById("histdrop"); if (hm) hm.classList.remove("open");
    hideHint();
  }
  function hideHint() {
    var hd = document.getElementById("hintdrop");
    if (hd) hd.classList.remove("open");
  }

  /* ================= address edit ================= */
  function openEditor() {
    var leaf = curLeaf();
    T.editing = { leaf: leaf.id, value: leaf.kind === "dir" ? leaf.place : "" };
    T.hintSel = 0;
    render();
    var input = document.getElementById("addrinput");
    input.value = T.editing.value;
    input.focus();
    input.select();
    updateHint();
  }
  function closeEditor(restore) {
    T.editing = null;
    hideHint();
    render();
    if (restore) document.getElementById("addrcard").focus();
  }
  function resolveBase(v) {
    v = norm(v);
    if (!v || v[0] !== "~") return null;
    var parts = v.replace(/\/+$/, "").split("/").filter(Boolean).slice(1);
    var acc = "~";
    var i = 0;
    for (; i < parts.length; i++) {
      var cand = acc === "~" ? "~/" + parts[i] : acc + "/" + parts[i];
      if (FS[cand] && FS[cand].t === "d") acc = cand;
      else break;
    }
    return { dir: acc, rest: parts.slice(i).join("/"), exact: i === parts.length };
  }
  function hintItems() {
    var v = document.getElementById("addrinput").value;
    var r = resolveBase(v);
    if (!r) return { items: [], isPath: false };
    var ks = kidsOf(r.dir) || [];
    var frag = r.rest.toLowerCase();
    var dirs = ks.filter(function (k) { return k.node.t === "d" && (!frag || k.name.toLowerCase().indexOf(frag) === 0); });
    var files = ks.filter(function (k) { return k.node.t === "f" && frag && k.name.toLowerCase().indexOf(frag) === 0; });
    return { items: dirs.concat(files).slice(0, 20), isPath: true };
  }
  function updateHint() {
    var input = document.getElementById("addrinput");
    var hd = document.getElementById("hintdrop");
    if (!T.editing) { hideHint(); return; }
    var v = input.value;
    if (!v || norm(v)[0] !== "~") {
      if (v && v.length > 1) {
        hd.innerHTML = '<div class="hint-empty">Press Return to search “' + esc(v) + '” across the workspace</div>';
        hd.classList.add("open");
      } else hideHint();
      return;
    }
    var h = hintItems();
    if (!h.items.length) {
      hd.innerHTML = '<div class="hint-empty">No matches; press Return to search “' + esc(v) + '”</div>';
      hd.classList.add("open");
      return;
    }
    var cols = Math.min(5, Math.max(1, Math.floor(h.items.length / 2) + (h.items.length % 2)));
    var html = '<div class="hint-cols" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">' + h.items.map(function (k, i) {
      return '<div class="hitem' + (i === T.hintSel ? " sel" : "") + '" data-hint="' + i + '">' + fileIcon(k.node, k.node.img, k.name) + "<span>" + esc(k.name) + "</span></div>";
    }).join("") + "</div>";
    hd.innerHTML = html;
    hd.classList.add("open");
  }
  function acceptHint(idx) {
    var input = document.getElementById("addrinput");
    var h = hintItems();
    var k = h.items[idx != null ? idx : T.hintSel];
    if (!k) return;
    var r = resolveBase(input.value);
    var base = r ? r.dir : "~";
    var isDir = k.node.t === "d";
    input.value = base === "~" ? "~/" + k.name + (isDir ? "/" : "") : base + "/" + k.name + (isDir ? "/" : "");
    T.editing.value = input.value;
    T.hintSel = 0;
    updateHint();
  }
  function submitAddress() {
    var input = document.getElementById("addrinput");
    var v = norm(input.value.trim());
    if (!v) { closeEditor(true); return; }
    if (v[0] === "~") {
      var noTrail = v.replace(/\/+$/, "");
      if (FS[noTrail] && FS[noTrail].t === "d") {
        closeEditor(false);
        navTo(noTrail);
        return;
      }
      if (FS[noTrail] && FS[noTrail].t === "f") {
        var par = parentOf(noTrail);
        closeEditor(false);
        navTo(par || "~");
        return;
      }
      var r = resolveBase(v);
      if (r && !r.rest) { closeEditor(false); navTo(r.dir); return; }
      /* inexact path: accept the first hint completion if it is a directory */
      var h = hintItems();
      if (h.items.length && h.items[0].node.t === "d") {
        var cand2 = h.items[0].path;
        closeEditor(false);
        navTo(cand2);
        return;
      }
    }
    /* search as place */
    var leaf = curLeaf();
    closeEditor(false);
    goLeaf(leaf, { kind: "search", query: v }, true);
    closeOverlays();
  }

  /* ================= tabs ================= */
  function newTab(entry) {
    var leaf = makeLeaf(entry && entry.kind || "start", entry && entry.place, entry && entry.query);
    var tb = tabFromLeaf(leaf);
    T.tabs.push(tb); T.active = tb.id;
    render();
  }
  function closeTab(id) {
    if (T.tabs.length <= 1) { newTab(); T.tabs = T.tabs.filter(function (t) { return t.id !== id; }); T.active = T.tabs[T.tabs.length - 1].id; render(); return; }
    var idx = T.tabs.findIndex(function (t) { return t.id === id; });
    var tb = T.tabs[idx];
    var names = Object.keys(tb.leaves).map(function (k) { return leafTitle(tb.leaves[k]); });
    T.closed.unshift({ tree: tb.root, leaves: tb.leaves, names: names });
    T.closed = T.closed.slice(0, 30);
    T.tabs.splice(idx, 1);
    if (T.active === id) T.active = T.tabs[Math.max(0, idx - 1)].id;
    render();
  }

  /* ================= split ================= */
  function findParent(node, leafId) {
    if (node.leaf) return null;
    if ((node.a.leaf === leafId) || (node.b.leaf === leafId)) return node;
    return findParent(node.a, leafId) || findParent(node.b, leafId);
  }
  function splitFocused(direction) {
    var t = curTab();
    var leaf = curLeaf();
    if (leaf.kind === "start") return;
    var nl = cloneLeaf(leaf);
    t.leaves[nl.id] = nl;
    var entry = { leaf: leaf.id };
    var node;
    /* direction = side the ORIGINAL pane is pushed to */
    if (direction === "right") node = { dir: "row", a: { leaf: nl.id }, b: entry };
    else if (direction === "left") node = { dir: "row", a: entry, b: { leaf: nl.id } };
    else if (direction === "down") node = { dir: "col", a: { leaf: nl.id }, b: entry };
    else node = { dir: "col", a: entry, b: { leaf: nl.id } };
    var parent = findParent(t.root, leaf.id);
    if (!parent) t.root = node;
    else if (parent.a.leaf === leaf.id) parent.a = node;
    else parent.b = node;
    t.focus = nl.id;
    render();
    toast("Split " + direction + "; new pane copies this place");
  }
  function closePane() {
    var t = curTab();
    if (leafCount(t) < 2) return;
    var fid = t.focus;
    var parent = findParent(t.root, fid);
    delete t.leaves[fid];
    if (!parent) return;
    var other = parent.a.leaf === fid ? parent.b : parent.a;
    if (t.root === parent) {
      t.root = other;
    } else {
      var gp = (function findG(n) {
        if (n.leaf) return null;
        if (n.a === parent || n.b === parent) return n;
        return findG(n.a) || findG(n.b);
      })(t.root);
      if (gp) { if (gp.a === parent) gp.a = other; else gp.b = other; }
    }
    t.focus = (function firstLeaf(n) { return n.leaf || firstLeaf(n.a); })(t.root);
    render();
  }

  /* ================= shelf ops ================= */
  function addToShelf(paths) {
    var added = 0;
    paths.forEach(function (p) {
      if (T.shelf.indexOf(p) === -1) { T.shelf.push(p); added++; }
    });
    if (added) { toast(added + " item" + (added > 1 ? "s" : "") + " shelved; originals untouched"); }
    T.shelfOpen = false;
    render();
  }
  function moveFiles(paths, targetDir) {
    var dirNode = FS[targetDir];
    if (!dirNode || dirNode.t !== "d") return;
    var moved = [];
    paths.forEach(function (p) {
      var n = FS[p];
      if (!n) return;
      var par = parentOf(p);
      var pk = FS[par];
      if (!pk) return;
      pk.kids = pk.kids.filter(function (k) { return k !== baseName(p); });
      delete FS[p];
      var np = targetDir === "~" ? "~/" + baseName(p) : targetDir + "/" + baseName(p);
      /* collision: keep both by suffixing */
      if (FS[np]) {
        var b = baseName(p), dot = b.lastIndexOf("."), stem = dot > 0 ? b.slice(0, dot) : b, ext = dot > 0 ? b.slice(dot) : "";
        var i = 2;
        while (FS[(np = targetDir + "/" + stem + " " + i + ext)]) i++;
        n.name = stem + " " + i + ext;
        FS[np] = n;
      } else {
        FS[np] = n;
      }
      dirNode.kids.push(n.name || baseName(np));
      if (n.name && n.name !== baseName(np)) { delete FS[np]; FS[targetDir + "/" + n.name] = n; np = targetDir + "/" + n.name; }
      moved.push({ from: p, to: np, name: baseName(np), parent: par });
      T.shelf = T.shelf.filter(function (s) { return s !== p; });
    });
    if (moved.length) {
      T.undo.push({ moves: moved });
      toast("Moved " + moved.length + " item" + (moved.length > 1 ? "s" : "") + " → " + baseName(targetDir) + " · ⌘Z to undo");
      render();
    }
  }
  function undoMove() {
    var u = T.undo.pop();
    if (!u) return;
    if (u.creates) {
      /* tool batch: products were created — undo removes them (audit trail kept) */
      u.creates.forEach(function (p) {
        if (!FS[p]) return;
        var par = parentOf(p);
        if (FS[par]) FS[par].kids = FS[par].kids.filter(function (k) { return k !== baseName(p); });
        delete FS[p];
        T.shelf = T.shelf.filter(function (s) { return s !== p; });
      });
      toast("Undone; engine kept the audit trail");
      render();
      return;
    }
    u.moves.slice().reverse().forEach(function (m) {
      var n = FS[m.to];
      if (!n) return;
      var toPar = parentOf(m.to);
      if (FS[toPar]) FS[toPar].kids = FS[toPar].kids.filter(function (k) { return k !== m.name; });
      delete FS[m.to];
      FS[m.from] = n;
      if (FS[m.parent]) FS[m.parent].kids.push(baseName(m.from));
    });
    toast("Undone; engine kept the audit trail");
    render();
  }

  /* ================= sidebar (window-level right dock) ================= */
  var SB_TOOLS = [
    { id: "convert", icon: "image", label: "Convert Format" },
    { id: "resize", icon: "resize", label: "Resize" }
  ];
  function stemOf(name) { var d = name.lastIndexOf("."); return d > 0 ? name.slice(0, d) : name; }
  function extOf(name) { var d = name.lastIndexOf("."); return d > 0 ? name.slice(d) : ""; }
  function sbSel() {
    var leaf = curLeaf();
    if (!leaf || leaf.kind !== "dir") return [];
    return leaf.sel.filter(function (p) { return FS[p] && FS[p].t === "f"; });
  }
  function sbIsImage(p) { return /\.(jpe?g|png)$/i.test(p); }
  function sbSelAllImages(sel) { return sel.length && sel.every(sbIsImage); }
  function sbDefaultPage(tool) {
    var sel = sbSel();
    var first = sel[0];
    var page = { tool: tool, format: "png", exif: true, w: "1600", h: "", lock: true, name: "", named: false, preview: false, running: false, ow: 0, oh: 0 };
    if (!first) return page;
    if (tool === "convert") page.name = stemOf(baseName(first)) + ".png";
    else page.name = stemOf(baseName(first)) + "-1600" + extOf(baseName(first));
    return page;
  }
  function openSbTool(id) {
    T.sbPage = sbDefaultPage(id);
    render();
    if (id === "resize") {
      /* real dimensions for the aspect lock — load the first selected image */
      var sel = sbSel();
      var first = sel[0];
      var node = first && FS[first];
      if (node && node.img) {
        var im = new Image();
        im.onload = function () {
          if (T.sbPage && T.sbPage.tool === "resize" && !T.sbPage.named) {
            T.sbPage.ow = im.naturalWidth; T.sbPage.oh = im.naturalHeight;
            if (T.sbPage.lock) {
              T.sbPage.h = String(Math.round(im.naturalHeight * (parseInt(T.sbPage.w, 10) / im.naturalWidth)));
              var hEl = document.getElementById("sb-h");
              if (hEl) hEl.value = T.sbPage.h;
            }
          }
        };
        im.src = rel(node.img);
      }
    }
  }
  function sbBuildOps(page) {
    var sel = sbSel();
    if (!sel.length) return [];
    var dir = parentOf(sel[0]) || "~";
    var extMap = { png: ".png", jpeg: ".jpg", heic: ".heic" };
    return sel.map(function (p) {
      var src = baseName(p);
      var stem = stemOf(src);
      var nn;
      if (page.tool === "convert") {
        var base = (sel.length === 1 && page.named) ? stemOf(page.name) : stem;
        nn = base + extMap[page.format];
      } else {
        var w = parseInt(page.w, 10) || 1600;
        var base2 = (sel.length === 1 && page.named) ? stemOf(page.name) : stem;
        nn = base2 + "-" + w + extOf(src);
      }
      /* WriteNaming: yield on collision */
      var cand = nn, k = 2;
      while (FS[dir + "/" + cand]) { cand = stemOf(nn) + " " + k + extOf(nn); k++; }
      return { from: p, to: dir + "/" + cand, name: cand };
    });
  }
  function sbFakeSize(src, page) {
    var m = /^([\d.]+)\s*(GB|MB|KB)?$/.exec(src.size || "");
    if (!m) return "—";
    var v = parseFloat(m[1]) * (m[2] === "GB" ? 1000 : m[2] === "KB" ? 0.001 : 1);
    var f = page.tool === "convert" ? 0.55 : 0.28;
    return (v * f).toFixed(1) + " MB";
  }
  function sbRun(page) {
    if (page.running) return;
    page.running = true;
    render();
    setTimeout(function () {
      var ops = sbBuildOps(page);
      var created = [];
      var kindMap = { png: "PNG Image", jpeg: "JPEG Image", heic: "HEIC Image" };
      ops.forEach(function (op) {
        var src = FS[op.from];
        if (!src) return;
        var par = parentOf(op.to);
        FS[op.to] = {
          t: "f",
          size: sbFakeSize(src, page),
          kind: page.tool === "convert" ? kindMap[page.format] : src.kind,
          mtime: "Oct 5, 2026",
          img: src.img || null
        };
        if (FS[par]) FS[par].kids.push(op.name);
        created.push(op.to);
      });
      if (created.length) T.undo.push({ creates: created });
      T.sbPage = null;
      var verb = page.tool === "convert" ? "Converted" : "Resized";
      var spec = page.tool === "convert" ? " → " + page.format.toUpperCase() : "";
      toast(verb + " " + created.length + (created.length > 1 ? " items" : " item") + spec + " · ⌘Z to undo");
      render();
    }, 480);
  }

  function renderSidebar() {
    var el = document.getElementById("sfsidebar");
    if (!el) return;
    el.classList.toggle("closed", !T.sidebarOpen);
    var btn = document.getElementById("btn-sidebar");
    if (btn) {
      btn.classList.toggle("on", T.sidebarOpen);
      btn.setAttribute("aria-pressed", T.sidebarOpen ? "true" : "false");
    }
    if (!T.sidebarOpen) return;
    var scroll = document.getElementById("sb-scroll");
    var pageEl = document.getElementById("sb-page");
    if (!scroll || !pageEl) return;
    if (T.sbPage) {
      scroll.style.display = "none";
      pageEl.style.display = "flex";
      pageEl.innerHTML = T.sbPage.preview ? sbPreviewHTML(T.sbPage) : sbParamHTML(T.sbPage);
    } else {
      scroll.style.display = "";
      pageEl.style.display = "none";
      pageEl.innerHTML = "";
      scroll.innerHTML = sbMainHTML();
    }
  }

  function sbMainHTML() {
    var leaf = curLeaf();
    if (!leaf || leaf.kind !== "dir") {
      return '<div class="sb-note">The sidebar follows the focused pane&rsquo;s selection.</div>';
    }
    var sel = sbSel();
    var info = "";
    if (!sel.length) {
      var ks = kidsOf(leaf.place) || [];
      info = '<div class="sb-card">' +
        '<div class="sb-prev">' + ic("folder") + "</div>" +
        '<div class="sb-name">' + esc(baseName(leaf.place) || "~") + "</div>" +
        '<div class="sb-kv"><span>Items</span><b>' + ks.length + "</b></div>" +
        "</div>";
    } else {
      var first = FS[sel[0]];
      var multi = sel.length > 1;
      var total = 0;
      sel.forEach(function (p) {
        var n = FS[p];
        if (!n) return;
        var m = /^([\d.]+)\s*(GB|MB|KB)?$/.exec(n.size || "");
        if (m) total += parseFloat(m[1]) * (m[2] === "GB" ? 1000 : m[2] === "KB" ? 0.001 : 1);
      });
      var prevInner = first && first.img
        ? '<img src="' + rel(first.img) + '" alt="">'
        : fileIcon(first, null, baseName(sel[0]));
      info = '<div class="sb-card">' +
        '<div class="sb-prev">' + prevInner + (multi ? '<span class="sb-count">' + sel.length + "</span>" : "") + "</div>" +
        '<div class="sb-name">' + esc(multi ? sel.length + " items selected" : baseName(sel[0])) + "</div>" +
        '<div class="sb-kv"><span>Kind</span><b>' + esc(multi ? "Mixed files" : (first ? first.kind : "")) + "</b></div>" +
        '<div class="sb-kv"><span>Size</span><b>' + (multi ? total.toFixed(1) + " MB total" : esc(first ? first.size : "")) + "</b></div>" +
        (!multi && first ? '<div class="sb-kv"><span>Modified</span><b>' + esc(first.mtime || "") + "</b></div>" : "") +
        (first && first.img ? '<div class="sb-tags" title="iceland"><i style="background:#ff5f57"></i><span class="tg-name">iceland</span></div>' : "") +
        "</div>";
    }
    var tools = "";
    if (sbSelAllImages(sel)) {
      tools = '<div class="sb-h">Tools · Images</div>' + SB_TOOLS.map(function (t) {
        return '<button class="sb-tool" data-sbtool="' + t.id + '"><span class="tico">' + ic(t.icon) + '</span><span class="lbl">' + esc(t.label) + "</span></button>";
      }).join("");
    } else if (sel.length) {
      tools = '<div class="sb-h">Tools</div><div class="sb-note">The app ships 11 built-in tools across image · PDF · audio/video · text; the demo wires the image pair.</div>';
    }
    return info + tools;
  }

  function sbNameField(page, sel) {
    if (sel.length === 1) {
      return '<input id="sb-name" type="text" value="' + esc(page.name) + '" spellcheck="false">';
    }
    return '<div class="sb-note" style="text-align:left;padding:4px 0">Output names derive per file; WriteNaming yields on collisions.</div>';
  }
  function sbParamHTML(page) {
    var sel = sbSel();
    if (!sel.length) return "";
    var title = page.tool === "convert" ? "Convert Format" : "Resize";
    var h = '<button class="sb-back" data-sb-back>' + ic("chevL") + "Tools</button>";
    h += '<div class="sb-page-body"><div class="sb-title">' + title + "</div>";
    if (page.tool === "convert") {
      h += '<div class="sb-field"><label>Format</label><div class="sb-seg">' +
        ["png", "jpeg", "heic"].map(function (f) {
          return '<button data-sb-fmt="' + f + '"' + (page.format === f ? ' class="on"' : "") + ">" + f.toUpperCase() + "</button>";
        }).join("") + "</div></div>";
      h += '<button class="sb-rowopt" data-sb-exif>Keep EXIF<span class="rsw"><span class="sb-sw' + (page.exif ? " on" : "") + '"></span></span></button><div style="height:12px"></div>';
      h += '<div class="sb-field"><label>Output name</label>' + sbNameField(page, sel) + "</div>";
    } else {
      h += '<div class="sb-field"><label>Width &times; Height</label><div class="sb-dim">' +
        '<input id="sb-w" type="number" min="16" max="10000" step="10" value="' + esc(page.w) + '">' +
        '<button class="lock' + (page.lock ? " on" : "") + '" data-sb-lock aria-label="Lock aspect ratio">' + ic("lock") + "</button>" +
        '<input id="sb-h" type="number" min="16" max="10000" step="10" value="' + esc(page.h) + '" placeholder="auto">' +
        "</div></div>";
      h += '<div class="sb-field"><label>Output name</label>' + sbNameField(page, sel) + "</div>";
    }
    h += '<div class="sb-field"><label>Target</label><div class="sb-note" style="text-align:left;padding:2px 0;font-family:var(--mono);font-size:10.5px">' + esc(sel[0].replace(/^~/, "~")) + "</div></div>";
    h += "</div>";
    h += '<div class="sb-foot"><button class="sb-btn primary" data-sb-preview>Preview</button></div>';
    return h;
  }
  function sbPreviewHTML(page) {
    var ops = sbBuildOps(page);
    var verb = page.tool === "convert" ? "Convert" : "Resize";
    var h = '<button class="sb-back" data-sb-back>' + ic("chevL") + "Tools</button>";
    h += '<div class="sb-page-body"><div class="sb-title">Preview</div>';
    h += '<div class="sb-ops">' + ops.map(function (op) {
      return '<div class="sb-op"><span class="from">' + esc(baseName(op.from)) + '</span><span class="arr">&#8594;</span><span class="to">' + esc(op.name) + "</span></div>";
    }).join("") + "</div>";
    h += '<div class="sb-note" style="text-align:left">Writes run through the pending-ops engine &mdash; preview, confirm, &#8984;Z.</div></div>';
    h += '<div class="sb-foot">' +
      '<button class="sb-btn" data-sb-back>Cancel</button>' +
      '<button class="sb-btn primary" data-sb-confirm' + (page.running ? " disabled" : "") + ">" +
      (page.running ? "Running&hellip;" : verb + " " + ops.length + (ops.length > 1 ? " Items" : " Item")) +
      "</button></div>";
    return h;
  }

  /* sidebar events (delegated — innerHTML is rebuilt by render) */
  (function sidebarEvents() {
    var el = document.getElementById("sfsidebar");
    if (!el) return;
    el.addEventListener("click", function (e) {
      var t = e.target;
      if (!t.closest) return;
      var tool = t.closest("[data-sbtool]");
      if (tool) { openSbTool(tool.dataset.sbtool); return; }
      if (t.closest("[data-sb-back]")) { T.sbPage = null; render(); return; }
      var fmt = t.closest("[data-sb-fmt]");
      if (fmt && T.sbPage) {
        T.sbPage.format = fmt.dataset.sbFmt;
        var sel = sbSel();
        if (T.sbPage.tool === "convert" && sel.length === 1 && !T.sbPage.named) {
          T.sbPage.name = stemOf(baseName(sel[0])) + (fmt.dataset.sbFmt === "jpeg" ? ".jpg" : "." + fmt.dataset.sbFmt);
        }
        render(); return;
      }
      if (t.closest("[data-sb-exif]") && T.sbPage) { T.sbPage.exif = !T.sbPage.exif; render(); return; }
      if (t.closest("[data-sb-lock]") && T.sbPage) { T.sbPage.lock = !T.sbPage.lock; render(); return; }
      if (t.closest("[data-sb-preview]") && T.sbPage) { T.sbPage.preview = true; T.sbPage.running = false; render(); return; }
      if (t.closest("[data-sb-confirm]") && T.sbPage) { sbRun(T.sbPage); return; }
    });
    el.addEventListener("input", function (e) {
      if (!T.sbPage) return;
      var id = e.target.id;
      if (id === "sb-name") {
        T.sbPage.name = e.target.value;
        T.sbPage.named = !!e.target.value.trim();
        return;
      }
      if (id === "sb-w") {
        T.sbPage.w = e.target.value;
        var w2 = parseInt(e.target.value, 10);
        if (T.sbPage.lock && T.sbPage.ow && w2) {
          T.sbPage.h = String(Math.round(T.sbPage.oh * w2 / T.sbPage.ow));
          var hEl = document.getElementById("sb-h");
          if (hEl && document.activeElement !== hEl) hEl.value = T.sbPage.h;
        }
        var sel = sbSel();
        if (!T.sbPage.named && w2 && sel.length === 1) {
          T.sbPage.name = stemOf(baseName(sel[0])) + "-" + w2 + extOf(baseName(sel[0]));
          var nEl = document.getElementById("sb-name");
          if (nEl && document.activeElement !== nEl) nEl.value = T.sbPage.name;
        }
        return;
      }
      if (id === "sb-h") { T.sbPage.h = e.target.value; return; }
    });
  })();

  /* ================= pointer DnD ================= */
  var drag = null;
  var suppressClick = false;
  function startDrag(e, paths, fromShelf) {
    if (paths.length === 0) return;
    drag = { paths: paths, fromShelf: !!fromShelf, x: e.clientX, y: e.clientY, active: false };
  }
  function dragMove(e) {
    if (!drag) return;
    if (!drag.active) {
      if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) < 4) return;
      drag.active = true;
      var chip = document.createElement("div");
      chip.className = "dragchip";
      chip.id = "dragchip";
      var p0 = drag.paths[0];
      var n0 = FS[p0];
      chip.innerHTML = (n0 && n0.img ? '<img src="' + rel(n0.img) + '" alt="">' : fileIcon(n0, null, baseName(p0))) +
        "<span>" + esc(baseName(p0)) + "</span>" + (drag.paths.length > 1 ? '<span class="cnt">' + drag.paths.length + "</span>" : "");
      document.body.appendChild(chip);
      if (T.shelf.length || drag.fromShelf) T.shelfOpen = true;
      render();
      document.getElementById("shelfanchor").classList.add("hungry");
    }
    var chip = document.getElementById("dragchip");
    chip.style.left = e.clientX + "px";
    chip.style.top = e.clientY + "px";
    /* targets */
    clearDropTargets();
    var el = document.elementFromPoint(e.clientX, e.clientY);
    var row = el && el.closest ? el.closest("[data-path]") : null;
    if (row && row.dataset.type === "d" && drag.paths.indexOf(row.dataset.path) === -1) {
      row.classList.add("drop-target");
      drag.target = { kind: "dir", path: row.dataset.path };
    } else {
      var shelfEl = el && el.closest ? el.closest("#shelfanchor, #shelfcard") : null;
      if (shelfEl) drag.target = { kind: "shelf" };
      else drag.target = null;
    }
  }
  function clearDropTargets() {
    Array.prototype.forEach.call(document.querySelectorAll(".drop-target"), function (el) { el.classList.remove("drop-target"); });
  }
  function dragEnd() {
    if (!drag) return;
    if (!drag.active) { drag = null; return; }
    var chip = document.getElementById("dragchip");
    if (chip) chip.remove();
    document.getElementById("shelfanchor").classList.remove("hungry");
    clearDropTargets();
    if (drag.target) {
      if (drag.target.kind === "shelf") {
        if (drag.fromShelf) { /* re-order no-op */ }
        else addToShelf(drag.paths);
      } else if (drag.target.kind === "dir") {
        moveFiles(drag.paths, drag.target.path);
      }
    }
    if (T.shelf.length === 0) T.shelfOpen = false;
    drag = null;
    suppressClick = true;
    setTimeout(function () { suppressClick = false; }, 60);
    render();
  }
  document.addEventListener("pointermove", dragMove);
  document.addEventListener("pointerup", dragEnd);

  /* ================= context menu ================= */
  function openCtx(e, leafId) {
    e.preventDefault();
    var m = document.getElementById("ctxmenu");
    var t = curTab();
    var cnt = leafCount(t);
    m.innerHTML =
      '<div class="ctx-item disabled">Sort By<span class="sub">' + ic("chevR") + "</span></div>" +
      '<div class="ctx-item disabled">New Folder</div>' +
      '<div class="ctx-sep"></div>' +
      '<div class="ctx-wrap"><div class="ctx-item" data-sub="split">Split Pane<span class="sub">' + ic("chevR") + '</span></div>' +
      '<div class="ctx-sub">' +
      '<div class="ctx-item" data-split="up">Split Up</div>' +
      '<div class="ctx-item" data-split="down">Split Down</div>' +
      '<div class="ctx-item" data-split="left">Split Left</div>' +
      '<div class="ctx-item" data-split="right">Split Right</div>' +
      "</div></div>" +
      (cnt > 1 ? '<div class="ctx-item" data-act="closepane">Close Pane</div>' : "");
    m.classList.add("open");
    var r = m.getBoundingClientRect();
    var x = Math.min(e.clientX, window.innerWidth - r.width - 8);
    var y = Math.min(e.clientY, window.innerHeight - r.height - 8);
    m.style.left = x + "px";
    m.style.top = y + "px";
    t.focus = leafId;
    render();
  }
  document.addEventListener("click", function () {
    var m = document.getElementById("ctxmenu");
    if (m) m.classList.remove("open");
    T.histOpen = false;
    var hd = document.getElementById("histdrop"); if (hd) hd.classList.remove("open");
  });

  /* ================= events ================= */
  win.addEventListener("click", function (e) {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
    var el = e.target;

    var close = el.closest ? el.closest("[data-close]") : null;
    if (close) { e.stopPropagation(); closeTab(close.dataset.close); return; }
    var tb2 = el.closest ? el.closest("[data-tab]") : null;
    if (tb2) { T.active = tb2.dataset.tab; render(); return; }
    if (el.closest && el.closest("#tplus")) { newTab(); return; }

    if (el.closest && el.closest("#btn-up")) { var l0 = curLeaf(); if (l0.kind === "dir") { var p = parentOf(l0.place); if (p) goLeaf(l0, { kind: "dir", place: p }, true); } return; }
    if (el.closest && el.closest("#btn-back")) { var lb = curLeaf(); if (lb.back.length) { var eb = lb.back.pop(); lb.fwd.push(entryOf(lb)); goLeaf(lb, eb, false); } return; }
    if (el.closest && el.closest("#btn-fwd")) { var lf = curLeaf(); if (lf.fwd.length) { var ef = lf.fwd.pop(); lf.back.push(entryOf(lf)); goLeaf(lf, ef, false); } return; }
    var seg = el.closest ? el.closest("#viewseg button") : null;
    if (seg) { curLeaf().view = seg.dataset.view; render(); return; }
    if (el.closest && el.closest("#btn-sidebar")) { T.sidebarOpen = !T.sidebarOpen; T.sbPage = null; render(); return; }

    var crumb = el.closest ? el.closest("[data-crumb]") : null;
    if (crumb) { navTo(crumb.dataset.crumb); return; }
    if (el.closest && el.closest('[data-act="up"]') && !el.closest("[disabled]")) {
      var lup = curLeaf();
      if (lup.kind === "dir") { var pup = parentOf(lup.place); if (pup) goLeaf(lup, { kind: "dir", place: pup }, true); }
      return;
    }
    if (el.closest && el.closest("#addrcard") && !T.editing) { openEditor(); return; }

    var hist = el.closest ? el.closest("[data-hist]") : null;
    if (hist) {
      var leaf = curLeaf();
      var parts = hist.dataset.hist.split(":");
      if (parts[0] === "back") { var eb2 = leaf.back.splice(leaf.back.length - 1 - (+parts[1]), 1)[0]; leaf.fwd.push(entryOf(leaf)); goLeaf(leaf, eb2, false); }
      else { var ef2 = leaf.fwd.splice(+parts[1], 1)[0]; leaf.back.push(entryOf(leaf)); goLeaf(leaf, ef2, false); }
      T.histOpen = false;
      return;
    }

    var open = el.closest ? el.closest("[data-open]") : null;
    if (open) {
      var tb3 = curTab();
      var nl = makeLeaf("dir", open.dataset.open);
      tb3.leaves[nl.id] = nl; tb3.root = { leaf: nl.id }; tb3.focus = nl.id;
      render();
      return;
    }
    var lay = el.closest ? el.closest("[data-layout]") : null;
    if (lay) {
      var L = T.layouts.filter(function (x) { return x.name === lay.dataset.layout; })[0];
      if (L) restoreLayout(L);
      return;
    }
    var closed = el.closest ? el.closest("[data-closed]") : null;
    if (closed) {
      var c = T.closed[+closed.dataset.closed];
      if (c) {
        var nt = { id: nid("t"), root: c.tree, focus: null, leaves: c.leaves, scroll: {} };
        nt.focus = (function first(n) { return n.leaf || first(n.a); })(nt.root);
        T.tabs.push(nt); T.active = nt.id;
        T.closed.splice(+closed.dataset.closed, 1);
        render();
      }
      return;
    }
    var hint = el.closest ? el.closest("[data-hint]") : null;
    if (hint) { acceptHint(+hint.dataset.hint); return; }

    if (el.closest && el.closest("#abtn-clock")) { T.histOpen = !T.histOpen; render(); return; }
    if (el.closest && el.closest("#abtn-star")) {
      var leaf2 = curLeaf();
      if (leaf2.kind === "dir") {
        var i = T.bookmarks.indexOf(leaf2.place);
        if (i === -1) { T.bookmarks.push(leaf2.place); toast("Bookmarked " + baseName(leaf2.place)); }
        else { T.bookmarks.splice(i, 1); toast("Bookmark removed"); }
        render();
      }
      return;
    }
    if (el.closest && el.closest("#abtn-copy")) {
      var leaf3 = curLeaf();
      if (leaf3.kind === "dir" && navigator.clipboard) navigator.clipboard.writeText("/Users/wuyuheng" + leaf3.place.slice(1)).catch(function () {});
      var b = document.getElementById("abtn-copy");
      b.innerHTML = ic("check");
      setTimeout(function () { b.innerHTML = ic("copy"); }, 1000);
      return;
    }
    if (el.closest && el.closest("#abtn-layout")) { document.getElementById("layoutmodal").classList.add("open"); var inp = document.getElementById("layoutname"); inp.value = ""; setTimeout(function () { inp.focus(); }, 30); return; }

    /* pane interactions */
    var paneEl = el.closest ? el.closest(".pane") : null;
    if (paneEl) {
      var pid = paneEl.dataset.pane;
      var t4 = curTab();
      if (t4.focus !== pid) { t4.focus = pid; render(); }
    }
    if (el.closest && el.closest("[data-act='closepane']")) { closePane(); return; }

    var gal = el.closest ? el.closest("[data-gal]") : null;
    if (gal) {
      var lp = curLeaf();
      lp.galSel = +gal.dataset.gal;
      lp.sel = [gal.dataset.path];
      render();
      return;
    }
    if (el.closest && el.closest("#shelfclear")) { T.shelf = []; T.shelfOpen = false; toast("Shelf cleared; references only, files untouched"); render(); return; }
    if (el.closest && el.closest("#shelfcollapse")) { T.shelfOpen = false; render(); return; }
    if (el.closest && el.closest("#shelfstack")) { T.shelfOpen = !T.shelfOpen; render(); return; }
    var rm = el.closest ? el.closest("[data-rm]") : null;
    if (rm) { T.shelf.splice(+rm.dataset.rm, 1); if (!T.shelf.length) T.shelfOpen = false; render(); return; }

    /* rows */
    var row = el.closest ? el.closest(".filerow, .ico-cell, .hier-row") : null;
    if (row && row.dataset.path) {
      var leaf4 = curLeaf();
      var path = row.dataset.path;
      if (row.dataset.type === "d") {
        if (row.classList.contains("hier-row")) {
          var kidsEl = win.querySelector('[data-kids="' + CSS.escape(path) + '"]');
          if (kidsEl) kidsEl.classList.toggle("hidden");
        }
        goLeaf(leaf4, { kind: "dir", place: path }, true);
      } else {
        var idx = leaf4.sel.indexOf(path);
        if (e.metaKey || e.ctrlKey) {
          if (idx === -1) leaf4.sel.push(path); else leaf4.sel.splice(idx, 1);
        } else {
          leaf4.sel = [path];
        }
        render();
      }
      return;
    }
  });

  /* dblclick blank tabstrip → new tab; middle-click a pill → close it */
  document.getElementById("tabstrip").addEventListener("dblclick", function (e) {
    if (e.target.id === "tabstrip") newTab();
  });
  document.getElementById("tabstrip").addEventListener("auxclick", function (e) {
    if (e.button !== 1) return;
    var p = e.target.closest ? e.target.closest("[data-tab]") : null;
    if (p) { e.preventDefault(); closeTab(p.dataset.tab); }
  });

  /* row drag start + context menu on pane blank */
  win.addEventListener("pointerdown", function (e) {
    var row = e.target.closest ? e.target.closest(".filerow, .ico-cell") : null;
    if (row && row.dataset.path && e.button === 0) {
      var leaf = curLeaf();
      var path = row.dataset.path;
      if (row.dataset.type === "f") {
        if (leaf.sel.indexOf(path) === -1) { leaf.sel = [path]; render(); }
        startDrag(e, leaf.sel.slice());
      }
    }
    var sitem = e.target.closest ? e.target.closest(".shelf-item, .shelf-stack") : null;
    if (sitem && e.button === 0) {
      startDrag(e, T.shelf.slice(), true);
    }
  });
  win.addEventListener("contextmenu", function (e) {
    if (e.target.closest && e.target.closest("#shelfcard, #shelfanchor, .shelf-item, .shelf-stack")) return;
    if (e.target.closest && e.target.closest("[data-path]")) return; /* no item menu in demo */
    if (e.target.closest && e.target.closest(".addrcard, .tabstrip, .bmkbar-app, .sbar, .tb, .findpanel")) return;
    var paneEl = e.target.closest ? e.target.closest(".pane") : null;
    if (paneEl) {
      var pid = paneEl.dataset.pane;
      var t = curTab();
      if (t.focus !== pid) { t.focus = pid; render(); }
      var leaf = t.leaves[pid];
      if (leaf.kind === "dir") openCtx(e, pid);
    }
  });

  /* address input events */
  var addrInput = document.getElementById("addrinput");
  var deb = null;
  addrInput.addEventListener("input", function () {
    if (T.editing) T.editing.value = addrInput.value;
    clearTimeout(deb);
    deb = setTimeout(updateHint, 110);
  });
  addrInput.addEventListener("keydown", function (e) {
    if (e.key === "Tab") { e.preventDefault(); acceptHint(e.shiftKey ? null : T.hintSel); if (e.shiftKey) { var h = hintItems(); T.hintSel = (T.hintSel - 1 + h.items.length) % h.items.length; updateHint(); } }
    else if (e.key === "Enter") { e.preventDefault(); submitAddress(); }
    else if (e.key === "Escape") {
      var hd = document.getElementById("hintdrop");
      if (hd.classList.contains("open")) hideHint();
      else closeEditor(true);
    }
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      var h2 = hintItems();
      if (h2.items.length) {
        e.preventDefault();
        T.hintSel = e.key === "ArrowDown" ? (T.hintSel + 1) % h2.items.length : (T.hintSel - 1 + h2.items.length) % h2.items.length;
        updateHint();
      }
    }
  });
  document.addEventListener("click", function (e) {
    if (T.editing && !e.target.closest("#addrcard, #hintdrop")) closeEditor(true);
  });

  /* layout modal */
  document.getElementById("layoutsave").addEventListener("click", function () {
    var name = document.getElementById("layoutname").value.trim();
    if (!name) return;
    var t = curTab();
    var leaves = {};
    eachLeaf(t, function (l) { leaves[l.id] = cloneLeaf(l); });
    T.layouts.push({ name: name, tree: JSON.parse(JSON.stringify(t.root)), leaves: leaves });
    document.getElementById("layoutmodal").classList.remove("open");
    toast("Layout “" + name + "” saved; find it in the bookmarks bar");
    render();
  });
  document.getElementById("layoutname").addEventListener("input", function () {
    document.getElementById("layoutsave").disabled = !this.value.trim();
  });
  document.getElementById("layoutcancel").addEventListener("click", function () {
    document.getElementById("layoutmodal").classList.remove("open");
  });
  function restoreLayout(L) {
    var nt = { id: nid("t"), root: L.tree, focus: null, leaves: {}, scroll: {} };
    /* re-id leaves to avoid collisions */
    (function reid(n) {
      if (n.leaf) {
        var old = L.leaves[n.leaf] || makeLeaf("dir", "~/Pictures/Photos/2026-iceland");
        var nl = cloneLeaf(old);
        nt.leaves[nl.id] = nl;
        n.leaf = nl.id;
      } else { reid(n.a); reid(n.b); }
    })(nt.root);
    nt.focus = (function first(n) { return n.leaf || first(n.a); })(nt.root);
    T.tabs.push(nt); T.active = nt.id;
    render();
  }

  /* find panel */
  document.getElementById("findgo").addEventListener("click", function () {
    var q = document.getElementById("findinput").value.trim();
    if (!q) return;
    var leaf = curLeaf();
    goLeaf(leaf, { kind: "search", query: q }, true);
    T.findOpen = false;
    render();
  });
  document.getElementById("findinput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("findgo").click();
    if (e.key === "Escape") { T.findOpen = false; render(); }
  });

  /* ================= global keys (scoped to window) ================= */
  document.addEventListener("keydown", function (e) {
    var mod = e.metaKey || e.ctrlKey;
    var inSbInput = e.target.closest && e.target.closest(".sfsidebar input");
    if (!mod || inSbInput) return;
    var winRect = win.getBoundingClientRect();
    var winVisible = winRect.top < window.innerHeight && winRect.bottom > 0;
    if (!winVisible) return;
    var k = e.key.toLowerCase();
    if (k === "t") { e.preventDefault(); newTab(); }
    else if (k === "w") {
      e.preventDefault();
      var tw = curTab();
      if (leafCount(tw) >= 2) closePane(); else closeTab(T.active);
    }
    else if (k === "l") { e.preventDefault(); openEditor(); }
    else if (k === "z") { e.preventDefault(); if (T.undo.length) undoMove(); }
    else if (k === "f") { e.preventDefault(); T.findOpen = true; render(); setTimeout(function () { document.getElementById("findinput").focus(); }, 30); }
    else if (k === "i" && e.altKey) { e.preventDefault(); T.sidebarOpen = !T.sidebarOpen; T.sbPage = null; render(); }
    else if (k === "arrowup" && !e.shiftKey) { e.preventDefault(); var l = curLeaf(); if (l.kind === "dir") { var p = parentOf(l.place); if (p) goLeaf(l, { kind: "dir", place: p }, true); } }
    else if (["1", "2", "3", "4"].indexOf(k) !== -1) {
      e.preventDefault();
      curLeaf().view = ["list", "hier", "icons", "gallery"][+k - 1];
      render();
    }
  });
  /* Esc closes the sidebar's secondary page (params / preview) */
  win.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && T.sbPage) { T.sbPage = null; render(); }
  });

  /* context menu actions */
  document.getElementById("ctxmenu").addEventListener("click", function (e) {
    var sp = e.target.closest ? e.target.closest("[data-split]") : null;
    if (sp) { splitFocused(sp.dataset.split); this.classList.remove("open"); return; }
    var act = e.target.closest ? e.target.closest("[data-act]") : null;
    if (act && act.dataset.act === "closepane") { closePane(); this.classList.remove("open"); }
  });
  document.getElementById("ctxmenu").addEventListener("mouseover", function (e) {
    var wrap = e.target.closest ? e.target.closest(".ctx-wrap") : null;
    Array.prototype.forEach.call(this.querySelectorAll(".ctx-wrap"), function (w) {
      w.classList.toggle("sub-open", w === wrap);
    });
  });

  /* ================= try-hints & autoplay ================= */
  Array.prototype.forEach.call(document.querySelectorAll(".tryhint"), function (h) {
    h.addEventListener("click", function () {
      var act = h.dataset.act;
      win.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      if (act === "tab") newTab();
      else if (act === "split") splitFocused("right");
      else if (act === "addr") openEditor();
      else if (act === "shelf") { toast("Drag any photo; the shelf appears top right to catch it"); }
      else if (act === "sb") {
        var lf = curLeaf();
        if (lf.kind === "dir") {
          var ph = (kidsOf(lf.place) || []).filter(function (k) { return k.node.t === "f" && /\.(jpe?g|png)$/i.test(k.name); });
          if (ph.length) { lf.sel = ph.slice(0, 2).map(function (x) { return x.path; }); }
        }
        if (!T.sidebarOpen) { T.sidebarOpen = true; }
        if (sbSel().length) openSbTool("convert");
        else toast("Select a photo in the window first; sidebar tools follow the selection");
      }
    });
  });

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, reduced ? 0 : ms); }); }
  async function autoplay() {
    document.getElementById("autoplay").classList.remove("show");
    /* ensure single home tab */
    T.tabs = [T.tabs.filter(function (t) { return t.id === T.active; })[0] || T.tabs[0]];
    T.active = T.tabs[0].id;
    var leaf = curLeaf();
    goLeaf(leaf, { kind: "dir", place: "~" }, false);
    await sleep(500);
    openEditor();
    var input = document.getElementById("addrinput");
    input.value = "~/";
    T.editing.value = "~/";
    updateHint();
    await sleep(700);
    acceptHint(0); /* Pictures */
    await sleep(650);
    acceptHint(0); /* Photos */
    await sleep(650);
    input.value = input.value + "2026";
    T.editing.value = input.value;
    updateHint();
    await sleep(600);
    submitAddress();
    await sleep(700);
    splitFocused("right");
    await sleep(600);
    var seg = document.querySelector('#viewseg button[data-view="gallery"]');
    if (seg) seg.click();
    await sleep(700);
    /* sidebar: select two photos, open the tool pipeline */
    var leafA = curLeaf();
    var ph = (kidsOf(leafA.place) || []).filter(function (k) { return k.node.t === "f" && /\.(jpe?g|png)$/i.test(k.name); });
    if (ph.length >= 2) {
      leafA.sel = [ph[0].path, ph[1].path];
      T.sidebarOpen = true;
      render();
      await sleep(650);
      openSbTool("convert");
      await sleep(800);
      if (T.sbPage) { T.sbPage.preview = true; render(); }
      await sleep(800);
      T.sbPage = null;
      render();
    }
  }
  var ap = document.getElementById("autoplay");
  if (ap) {
    ap.querySelector("button").addEventListener("click", autoplay);
    if (window.matchMedia("(max-width: 980px)").matches && !reduced) ap.classList.add("show");
  }

  /* ================= reveal ================= */
  var rvEls = document.querySelectorAll(".rv");
  if (reduced || !("IntersectionObserver" in window)) {
    rvEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.style.setProperty("--d", (Math.min(parseInt(el.dataset.step || "0", 10), 4) * 0.07) + "s");
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    rvEls.forEach(function (el) { io.observe(el); });
  }
  /* ================= plugin demo: the selection drives the sidebar ================= */
  (function () {
    var demo = document.getElementById("ffd");
    if (!demo) return;

    var isEN = /^en/i.test(document.documentElement.lang || "");
    function l(x) { return typeof x === "string" ? x : x[isEN ? "en" : "zh"]; }
    var TX = isEN ? {
      idle: "Press play",
      working: "Working…",
      done: "Done · ⌘Z to undo",
      undone: "Undone; the files are back where they were",
      play: "Play", pause: "Pause", replay: "Replay",
      plugins: "Plugins", builtin: "Built-in", add: "＋ Add a plugin…"
    } : {
      idle: "点播放看它跑一遍",
      working: "正在处理…",
      done: "已完成 · ⌘Z 可撤回",
      undone: "已撤回，文件回到原处",
      play: "播放演示", pause: "暂停", replay: "重播",
      plugins: "插件", builtin: "内置", add: "＋ 添加插件…"
    };

    /* one mixed folder: clicking a file selects its type group */
    var MIX = [
      { scn: 0, img: "assets/img/photos/aurora.jpg", name: "DSC_4188.jpg" },
      { scn: 0, img: "assets/img/photos/black-beach.jpg", name: "DSC_4231.jpg" },
      { scn: 0, img: "assets/img/photos/basalt-cave.jpg", name: "DSC_4476.jpg" },
      { scn: 1, tile: "CSV", bg: "#FFF3D6", name: "projects.csv" },
      { scn: 2, tile: "PNG", bg: "#E2F0FB", name: "export_v1.png" },
      { scn: 2, tile: "PNG", bg: "#E2F0FB", name: "export_v2.png" },
      { scn: 2, tile: "PNG", bg: "#E2F0FB", name: "export_final.png" },
      { ctx: true, ico: "doc", name: "Notes from the trip.md" }
    ];

    var SCN = [
      {
        head: { zh: "JPEG 照片 · 已选 3 项", en: "JPEG photos · 3 selected" },
        plugin: { zh: "按日期归档照片", en: "Archive photos by date" },
        ico: "clock",
        tools: [
          { ico: "copy", zh: "转格式", en: "Convert" },
          { ico: "resize", zh: "缩放", en: "Resize" },
          { ico: "image", zh: "抠图", en: "Cutout" }
        ],
        rows: [
          { name: "DSC_4188.jpg", sub: "→ 2026-07-14/DSC_4188.jpg" },
          { name: "DSC_4231.jpg", sub: "→ 2026-07-14/DSC_4231.jpg" },
          { name: "DSC_4476.jpg", sub: "→ 2026-07-15/DSC_4476.jpg" }
        ]
      },
      {
        head: { zh: "CSV · 已选 1 项", en: "CSV · 1 selected" },
        plugin: { zh: "从 CSV 生成文件", en: "Generate files from a CSV" },
        ico: "doc",
        tools: [
          { ico: "copy", zh: "转格式", en: "Convert" }
        ],
        out: [
          { name: "clients/acme.md", sub: { zh: "← projects.csv · 第 2 行", en: "← projects.csv · row 2" } },
          { name: "clients/borax.md", sub: { zh: "← projects.csv · 第 3 行", en: "← projects.csv · row 3" } },
          { name: "clients/cyan.md", sub: { zh: "← projects.csv · 第 4 行", en: "← projects.csv · row 4" } }
        ]
      },
      {
        head: { zh: "PNG · 已选 3 项", en: "PNG · 3 selected" },
        plugin: { zh: "整理交付物", en: "Tidy the delivery" },
        ico: "tray",
        tools: [
          { ico: "list", zh: "批量重命名", en: "Batch Rename" }
        ],
        rows: [
          { name: "export_v1.png", sub: "→ delivery/2026-07-14-01.png" },
          { name: "export_v2.png", sub: "→ delivery/2026-07-14-02.png" },
          { name: "export_final.png", sub: "→ delivery/2026-07-14-03.png" }
        ]
      }
    ];

    var filesEl = demo.querySelector("#ffd-files");
    var sideEl = demo.querySelector("#ffd-side");
    var msgEl = demo.querySelector("#ffd-msg");
    var cntEl = demo.querySelector("#ffd-cnt");
    var fileEl = demo.querySelector("#ffd-file");
    var runBtn = demo.querySelector("#ffd-run");
    var undoBtn = demo.querySelector("#ffd-undo");

    var idx = 0, state = "idle", done = 0, timer = null;
    var ROW_IN = reduced ? 0 : 380, ROW_GAP = reduced ? 0 : 170;

    function scn() { return SCN[idx]; }
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

    function rowsHTML() {
      var s = scn();
      var acts = s.rows || s.out || [];
      var isOut = !!s.out;
      var showOut = isOut && state !== "idle" && state !== "undone";
      var actIdx = {};
      acts.forEach(function (r, i) { actIdx[r.name] = i; });
      function fin(i) { return state === "done" || (state === "paused" && i < done); }

      var html = MIX.map(function (m) {
        if (m.ctx) {
          return '<div class="ffd-row ctx"><span class="ffd-tile ctx">' + ic(m.ico) + "</span>" +
            '<span class="ffd-lines"><span class="ffd-name">' + esc(m.name) + "</span></span></div>";
        }
        var cur = m.scn === idx && actIdx[m.name] !== undefined;
        var i = cur ? actIdx[m.name] : -1;
        var tile = m.img
          ? '<span class="ffd-tile"><img src="' + rel(m.img) + '" alt="" loading="lazy"></span>'
          : '<span class="ffd-tile" style="background:' + m.bg + '">' + m.tile + "</span>";
        var sub = cur ? '<span class="ffd-to">' + esc(l(acts[i].sub)) + "</span>" : "";
        var check = cur ? '<span class="ffd-ok">' + ic("check") + "</span>" : "";
        var bar = cur ? '<i class="bar"></i>' : "";
        return '<button class="ffd-row' + (m.scn === idx ? " sel" : "") + (cur && fin(i) ? " done" : "") + '" type="button" aria-pressed="' + (m.scn === idx ? "true" : "false") + '" data-scn="' + m.scn + '"' + (cur ? ' data-act="' + i + '"' : "") + ">" + tile +
          '<span class="ffd-lines"><span class="ffd-name">' + esc(m.name) + "</span>" + sub + "</span>" + check + bar + "</button>";
      }).join("");

      if (isOut) {
        html += s.out.map(function (r, i) {
          var cls = showOut ? (fin(i) ? " done" : " pending") : " out-hidden";
          return '<div class="ffd-row out' + cls + '"' + (showOut ? ' data-act="' + i + '"' : "") + ">" +
            '<span class="ffd-tile" style="background:#E4F5E9">MD</span>' +
            '<span class="ffd-lines"><span class="ffd-name">' + esc(r.name) + '</span><span class="ffd-to">' + esc(l(r.sub)) + "</span></span>" +
            '<span class="ffd-ok">' + ic("check") + '</span><i class="bar"></i></div>';
        }).join("");
      }
      return html;
    }

    function sideHTML() {
      var s = scn();
      var tools = s.tools.map(function (t) {
        return '<div class="ffd-tool static"><span class="ffd-tool-ico">' + ic(t.ico) + '</span><span class="ffd-tool-name">' + esc(l(t)) + "</span></div>";
      }).join("");
      return '<div class="ffd-side-head">' + esc(l(s.head)) + "</div>" +
        '<div class="ffd-glabel">' + TX.plugins + "</div>" +
        '<button class="ffd-tool" id="ffd-tool" type="button">' +
          '<span class="ffd-tool-ico">' + ic(s.ico) + '</span>' +
          '<span class="ffd-tool-name">' + esc(l(s.plugin)) + "</span>" +
          '<span class="ffd-ok">' + ic("check") + '</span><i class="bar"></i></button>' +
        (tools ? '<div class="ffd-glabel">' + TX.builtin + "</div>" + tools : "") +
        '<div class="ffd-add">' + TX.add + "</div>";
    }

    function paint() {
      fileEl.textContent = "Inbox";
      var n = 8 + (idx === 1 && state !== "idle" && state !== "undone" ? scn().out.length : 0);
      cntEl.textContent = l({ zh: n + " 项", en: n + " items" });
      filesEl.innerHTML = rowsHTML();
      sideEl.innerHTML = sideHTML();
      var tool = sideEl.querySelector("#ffd-tool");
      if (tool) {
        if (state === "running" || state === "paused") tool.classList.add("busy");
        if (state === "done") tool.classList.add("done");
        tool.addEventListener("click", runToggle);
      }
      runBtn.disabled = false;
      undoBtn.hidden = state !== "done";
      if (state === "running") {
        runBtn.textContent = TX.pause;
        runBtn.className = "ffd-btn";
        msgEl.textContent = TX.working;
      } else if (state === "paused") {
        runBtn.textContent = TX.play;
        runBtn.className = "ffd-btn primary";
        msgEl.textContent = TX.working;
      } else if (state === "done") {
        runBtn.textContent = TX.replay;
        runBtn.className = "ffd-btn";
        msgEl.textContent = TX.done;
      } else {
        runBtn.textContent = TX.play;
        runBtn.className = "ffd-btn primary";
        msgEl.textContent = state === "undone" ? TX.undone : TX.idle;
      }
    }

    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }
    function finish() { state = "done"; paint(); }

    function step() {
      var acts = filesEl.querySelectorAll("[data-act]");
      if (done >= acts.length) { finish(); return; }
      var row = acts[done];
      if (row) row.classList.add("busy");
      timer = setTimeout(function () {
        timer = null;
        if (row) { row.classList.remove("busy"); row.classList.remove("pending"); row.classList.add("done"); }
        done++;
        if (done >= acts.length) { finish(); return; }
        timer = setTimeout(step, ROW_GAP);
      }, ROW_IN);
    }

    function start() {
      clearTimer();
      if (state === "paused") { state = "running"; paint(); step(); return; }
      state = "running";
      done = 0;
      paint();
      step();
    }

    function pause() { clearTimer(); state = "paused"; paint(); }

    function undo() {
      clearTimer();
      state = "undone";
      done = 0;
      paint();
    }

    function selectGroup(i) {
      clearTimer();
      idx = i;
      done = 0;
      state = "idle";
      paint();
    }

    function runToggle() {
      if (state === "running") pause(); else start();
    }

    filesEl.addEventListener("click", function (e) {
      var row = e.target.closest("[data-scn]");
      if (!row) return;
      var i = parseInt(row.getAttribute("data-scn"), 10);
      if (i !== idx) selectGroup(i);
    });
    runBtn.addEventListener("click", runToggle);
    undoBtn.addEventListener("click", undo);

    if (reduced) state = "done";
    paint();

    /* play once when the card scrolls into view */
    if (!reduced && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.disconnect();
          if (state === "idle") start();
        });
      }, { threshold: 0.25 });
      io.observe(demo);
    }
  })();

  render();
})();
