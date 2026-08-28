import {
  FileText,
  MessageCircle,
  Share2,
  Star,
  Megaphone,
  Search,
  Languages,
  Wand2,
  DollarSign,
} from "lucide-react";

const tools = [
  { icon: FileText, name: "Listing" },
  { icon: MessageCircle, name: "Messages" },
  { icon: Share2, name: "Social" },
  { icon: Star, name: "Reviews" },
  { icon: Megaphone, name: "Announce" },
  { icon: Search, name: "Keywords" },
  { icon: Languages, name: "Translate" },
  { icon: Wand2, name: "Optimize" },
  { icon: DollarSign, name: "Pricing" },
];

export default function ProductWindow({
  dark = false,
  single = false,
  layered = false,
}: {
  dark?: boolean;
  single?: boolean;
  layered?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden rounded-[18px] border ${
        dark ? "border-[#3a3a3c] bg-[#000000]" : "border-[#e5e5e7] bg-white"
      }`}
    >
      {/* 标题栏 */}
      <div
        className={`flex items-center justify-between border-b px-5 py-3 ${
          dark ? "border-[#2c2c2e] bg-[#1d1d1f]" : "border-[#f0f0f2] bg-[#fbfbfd]"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className={`text-[12px] font-medium ${dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>
          Etsy Seller AI Toolkit
        </span>
        <span className="rounded-full bg-[#F1641E] px-2.5 py-0.5 text-[11px] font-semibold text-white">
          Pro
        </span>
      </div>

      <div className="flex">
        {/* 侧边栏 */}
        <div
          className={`${single ? "hidden" : "md:flex"} hidden w-44 flex-none flex-col gap-0.5 border-r p-3 ${
            dark ? "border-[#2c2c2e] bg-[#1d1d1f]" : "border-[#f0f0f2] bg-[#f5f5f7]"
          } ${
            layered
              ? "transition-all duration-300 ease-out hover:scale-[1.03] hover:z-10 hover:shadow-2xl"
              : ""
          }`}
        >
          {tools.map((t, i) => (
            <div
              key={t.name}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium ${
                i === 0
                  ? dark
                    ? "bg-[#3a3a3c] text-white"
                    : "bg-white text-[#1d1d1f] shadow-sm"
                  : dark
                    ? "text-[#86868b]"
                    : "text-[#4a4a4d]"
              }`}
            >
              <t.icon className="h-3.5 w-3.5 flex-none" strokeWidth={2} />
              <span className="truncate">{t.name}</span>
            </div>
          ))}
        </div>

        {/* 主区 */}
        <div className={`flex-1 ${single ? "p-6 md:p-10" : "p-5"}`}>
          <div className={`mb-3 text-[13px] font-semibold ${dark ? "text-white" : "text-[#1d1d1f]"}`}>
            Listing Generator
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {/* 输入 */}
            <div
              className={`flex flex-col gap-2.5 rounded-xl p-4 ${
                dark ? "bg-[#1d1d1f]" : "bg-[#f5f5f7]"
              } ${
                layered
                  ? "transition-all duration-300 ease-out hover:scale-[1.03] hover:z-10 hover:shadow-2xl"
                  : ""
              }`}
            >
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  dark ? "text-[#86868b]" : "text-[#6e6e73]"
                }`}
              >
                Product details
              </span>
              <div
                className={`rounded-lg p-3 text-[12px] leading-relaxed ${
                  dark ? "bg-[#000000] text-[#86868b]" : "bg-white text-[#86868b]"
                }`}
              >
                Handmade ceramic coffee mug, 12 oz, glazed in speckled cream, kiln-fired, food-safe,
                microwave &amp; dishwasher safe…
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["ceramic", "handmade", "minimalist"].map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                      dark
                        ? "border-[#3a3a3c] text-[#a1a1a6]"
                        : "border-[#d2d2d7] bg-white text-[#4a4a4d]"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="mt-0.5 rounded-full bg-[#F1641E] py-2 text-center text-[12px] font-semibold text-white">
                Generate listing
              </span>
            </div>

            {/* AI 输出 */}
            <div
              className={`flex flex-col gap-2.5 rounded-xl border p-4 ${
                dark ? "border-[#3a3a3c] bg-[#000000]" : "border-[#e5e5e7] bg-white"
              } ${
                layered
                  ? "transition-all duration-300 ease-out hover:scale-[1.03] hover:z-10 hover:shadow-2xl hover:border-white/30"
                  : ""
              }`}
            >
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  dark ? "text-[#86868b]" : "text-[#6e6e73]"
                }`}
              >
                AI output
              </span>
              <p className={`text-[14px] font-semibold leading-snug ${dark ? "text-white" : "text-[#1d1d1f]"}`}>
                Handmade Speckled Ceramic Coffee Mug
              </p>
              <p className={`text-[12px] leading-relaxed ${dark ? "text-[#a1a1a6]" : "text-[#4a4a4d]"}`}>
                A one-of-a-kind 12oz stoneware mug, thrown by hand and finished in a warm speckled cream
                glaze. Dishwasher and microwave safe.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["#ceramicmug", "#handmade", "#coffee"].map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      dark ? "bg-[#F1641E]/20 text-[#ff8a52]" : "bg-[#F1641E]/10 text-[#F1641E]"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
