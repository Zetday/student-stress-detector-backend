import { useLanguage } from "../src/contexts/LanguageContext";

export default function LeftPanel() {
  const { t } = useLanguage();

  return (
    <div
      className="
        relative 
        h-full
        bg-[#0A0A0A]
        text-white
        px-10 py-12
        flex flex-col justify-center
        overflow-hidden
      "
    >
      {/* subtle gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_35%)]" />

      {/* content */}
      <div className="relative z-10">

        {/* Heading */}
        <h1
          className="
            text-[40px] md:text-[54px]
            font-bold
            leading-[1.05]
            tracking-[-0.02em]
            mb-8
            max-w-md
          "
        >
          {t.Heading1}
          <br/>
          {t.Heading2}
        </h1>

        {/* Description */}
        <p
          className="
            text-gray-400
            text-[17px]
            leading-8
            max-w-md
            mb-10
          "
        >
          {t.Deskripsi}
        </p>

        {/* Feature cards */}
        <div className="space-y-5 max-w-xl">

          {/* Card 1 */}
          <div
            className="
              flex items-start gap-4
              rounded-2xl
              border border-white/10
              bg-white/[0.03]
              px-5 py-5
              backdrop-blur-sm
            "
          >
            {/* icon */}
            <div
              className="
                w-11 h-11
                rounded-xl
                bg-[#111827]
                border border-white/10
                flex items-center justify-center
                text-blue-400
                text-lg
                shrink-0
              "
            >
              📊
            </div>

            <div>
              <h3 className="text-[17px] font-semibold mb-1">
                {t.Subheading1}
              </h3>

              <p className="text-sm text-gray-400 leading-6">
                {t.Subdeskripsi1}
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="
              flex items-start gap-4
              rounded-2xl
              border border-white/10
              bg-white/[0.03]
              px-5 py-5
              backdrop-blur-sm
            "
          >
            {/* icon */}
            <div
              className="
                w-11 h-11
                rounded-xl
                bg-[#111827]
                border border-white/10
                flex items-center justify-center
                text-green-400
                text-lg
                shrink-0
              "
            >
              🔒
            </div>

            <div>
              <h3 className="text-[17px] font-semibold mb-1">
                {t.Subheading2}
              </h3>

              <p className="text-sm text-gray-400 leading-6">
                {t.Subdeskripsi2}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* footer */}
      <p
        className="
          relative z-10
          text-[11px]
          tracking-[0.25em]
          text-gray-600
          mt-16
        "
      >
        © 2026 CEKSTRESS. SCIENTIFIC ATELIER PRECISION.
      </p>
    </div>
  );
}