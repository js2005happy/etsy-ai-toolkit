import urllib.request, json, base64, sys

API = "http://49.235.118.200:3000/v1/images/generations"
KEY = "sk-S9aX7JSN9f1dnOMBnEBhzWbMQakoDdHQOlnJWOUAAJP7BHu8"
MODEL = "gpt-image-2-all"

prompt = (
    "Cinematic ultra-wide hero background for a handmade Etsy marketplace website. "
    "A warm artisan crafting workshop at dusk, moody film lighting, a wooden workbench "
    "laden with handmade crafts: rolls of linen fabric, yarn spools, brass scissors, "
    "wooden beads, dried flowers, a ceramic mug. Soft golden rim light from the left, "
    "deep cinematic shadows, shallow depth of field, anamorphic bokeh, subtle film grain, "
    "rich teal-and-amber color grade, atmospheric, empty composition with dark negative "
    "space on the right for text overlay. No text, no watermark, no people, no logo."
)

payload = {
    "model": MODEL,
    "prompt": prompt,
    "size": "1536x1024",
    "n": 1,
}

req = urllib.request.Request(
    API,
    data=json.dumps(payload).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {KEY}",
    },
)

try:
    resp = urllib.request.urlopen(req, timeout=300)
    data = json.loads(resp.read())
except Exception as e:
    print("REQUEST FAILED:", repr(e))
    sys.exit(1)

print("RESPONSE KEYS:", list(data.keys()))
items = data.get("data", [])
if not items:
    print("NO DATA:", json.dumps(data)[:2000])
    sys.exit(1)

item = items[0]
out = r"C:\Users\Administrator\etsy-ai-toolkit\public\hero-cinema.png"

if "b64_json" in item and item["b64_json"]:
    raw = base64.b64decode(item["b64_json"])
elif "url" in item and item["url"]:
    urllib.request.urlretrieve(item["url"], out)
    raw = None
    print("SAVED FROM URL:", out)
else:
    print("NO IMAGE FIELD:", json.dumps(item)[:2000])
    sys.exit(1)

if raw is not None:
    with open(out, "wb") as f:
        f.write(raw)
    print("SAVED", out, len(raw), "bytes")
