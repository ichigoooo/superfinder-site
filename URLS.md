# 绝对 URL 出现清单（colatech.cn 迁移核对表）

> 来源：`20261008-site-geo-seo` REQ-09。迁移日按本清单逐文件替换 `ichigoooo.github.io/superfinder-site` → 新域，收口判据 = `grep -r "ichigoooo.github.io" .` 零命中。
> 生成：2026-10-08，静态扫描（zh/en 页 + robots.txt + sitemap.xml + llms.txt + 404.html）。

## 出现矩阵

| 文件 | 绝对 URL（用途） |
|------|------------------|
| `index.html` | canonical / hreflang×3 / og:url / og:image / JSON-LD @id·url·logo·sameAs 外链 / screenshot / thumbnailUrl / contentUrl(promo-zh) |
| `en/index.html` | 同上（canonical→`/en/`；og:url→`/en/`；contentUrl→promo-en；sameAs 用 geo 中性商店链接） |
| `robots.txt` | `Sitemap:` 行 ×1 |
| `sitemap.xml` | `<loc>`×2 + `xhtml:link`×6 |
| `llms.txt` | Links 区 ×5（4 × github.io：双语言页 + DMG + 校验和；1 × apps.apple.com） |
| `404.html` | 站内绝对路径 ×4（favicon / site.css / 中文首页 / English home）——注意是路径前缀 `/superfinder-site/`，迁移后须改新站根或改相对 |

## 迁移动作（交给 `20261007-website-purchase` 槽执行）

1. 全量换域：按上表逐文件替换（含 404.html 的路径前缀改造）
2. GitHub Pages 配 custom domain → `ichigoooo.github.io/superfinder-site/*` 自动 301 至新域
3. GSC 旧属性走 Change of Address；新域重走站长验证 + sitemap 提交
4. 大陆备案要求：新站页脚展示 ICP 备案号并链工信部（beian.miit.gov.cn）
5. 旧 github.io GSC 属性保留 ≥6 个月再考虑移除
6. `download/SuperFinder-1.4.0.dmg` 直链变更后，对外已散发的旧直链依赖 301 兜底——确认 Pages 301 覆盖子路径
