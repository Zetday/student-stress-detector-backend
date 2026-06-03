import { Sparkles } from "lucide-react";

function AINarrativeCard({ 
  title = "AI Narrative Insight", 
  subtitle = "Berikut insight untuk minggu ini",
  description = "Analisis AI menunjukkan korelasi kuat antara siklus Assignment Late yang tinggi dan penurunan Sleep Quality. Dari data minggu ini, terdeteksi pola stress yang meningkat seiring dengan workload akademik yang naik. Disarankan untuk membedakan hidup dengan pekerjaan dan juga kesehatan harus prioritas utama. Waktu tidur berkualitas menjadi kunci dalam mengelola stress yang ada. Karir memang penting, namun kesehatan adalah investasi jangka panjang untuk produktivitas & juga kesehatan mental. Hal tersebut direkomendasikan untuk membedakan hidup dengan pekerjaan selama 22:00 untuk pemulihan lebih maksimal."
}) {
  return (
    <div className="theme-card border rounded-2xl p-6">
      <div className="flex gap-3 items-start">
        <div className="p-3 rounded-lg bg-blue-500/20">
          <Sparkles size={18} className="text-blue-400" />
        </div>

        <div>
          <h3 className="theme-text font-semibold text-lg">
            {title}
          </h3>

          <p className="theme-subtle text-sm">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="theme-card-muted mt-4 rounded-lg p-5 border">
        <p className="theme-muted leading-8 text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

export default AINarrativeCard;
