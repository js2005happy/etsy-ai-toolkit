from pathlib import Path

path = Path('app/tools/free-etsy-title-generator/page.tsx')
text = path.read_text()
text = text.replace(
    '"How to rank #1 on Etsy in 2026: the SEO playbook behind every winning listing",',
    '"Practical Etsy listing SEO guide for clearer titles and tags",',
)
text = text.replace('dateModified: "2026-09-04",', 'dateModified: "2026-09-08",')
path.write_text(text)
