import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronDown,
  Database,
  GitBranch,
  HeartPulse,
  History,
  LineChart,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"
import logo from "../assets/img/logo.png"

const navItems = [
  { label: "Beranda", href: "#beranda" },
  { label: "Fitur", href: "#fitur" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Tentang", href: "#tentang" },
  { label: "FAQ", href: "#faq" },
]

const stats = [
  { value: 500, suffix: "+", label: "Mahasiswa Terdaftar" },
  { value: 10000, suffix: "+", label: "Data Aktivitas Dianalisis" },
  { value: 85, suffix: "%", label: "Akurasi Prediksi" },
  { value: 24, suffix: "/7", label: "Monitoring Otomatis" },
]

const features = [
  {
    icon: Brain,
    title: "Deteksi Tingkat Stres",
    body: "Menghitung tingkat stres mahasiswa menggunakan model AI.",
  },
  {
    icon: Activity,
    title: "Monitoring Aktivitas Harian",
    body: "Melacak kebiasaan dan aktivitas yang memengaruhi kondisi mental.",
  },
  {
    icon: MessageCircle,
    title: "Analisis Media Sosial",
    body: "Menganalisis pola penggunaan media sosial sebagai indikator stres.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Interaktif",
    body: "Visualisasi data kondisi mahasiswa secara real-time.",
  },
  {
    icon: History,
    title: "Riwayat dan Tren",
    body: "Melihat perkembangan tingkat stres dari waktu ke waktu.",
  },
  {
    icon: Sparkles,
    title: "Rekomendasi Personal",
    body: "Memberikan saran dan insight berdasarkan hasil analisis.",
  },
]

const steps = [
  {
    icon: UserCheck,
    title: "Mahasiswa mengisi aktivitas harian.",
    body: "Input singkat membantu sistem memahami konteks akademik dan kebiasaan harian.",
  },
  {
    icon: Database,
    title: "Sistem mengumpulkan data perilaku.",
    body: "Aktivitas, kelelahan, mood, dan pola digital disatukan secara terstruktur.",
  },
  {
    icon: Zap,
    title: "Model AI melakukan analisis.",
    body: "Algoritma membaca pola risiko dan menghasilkan skor stres yang mudah dipahami.",
  },
  {
    icon: LineChart,
    title: "Dashboard menampilkan hasil dan rekomendasi.",
    body: "Mahasiswa dan pembimbing dapat melihat tren, insight, dan langkah tindak lanjut.",
  },
]

const audiences = [
  {
    icon: Users,
    title: "Mahasiswa",
    body: "Memantau kondisi mental secara mandiri.",
  },
  {
    icon: UserCheck,
    title: "Dosen Pembimbing",
    body: "Memahami kondisi mahasiswa dengan lebih baik.",
  },
  {
    icon: ShieldCheck,
    title: "Kampus",
    body: "Mendukung program kesehatan mental yang lebih efektif.",
  },
]

const faqs = [
  {
    question: "Apa itu Stress Detector?",
    answer:
      "Stress Detector adalah platform berbasis AI untuk membantu mahasiswa, dosen, dan institusi memantau indikasi tingkat stres melalui data aktivitas dan pola perilaku.",
  },
  {
    question: "Bagaimana sistem menghitung tingkat stres?",
    answer:
      "Sistem mengolah input aktivitas harian, tingkat kelelahan, mood, dan indikator perilaku lain untuk menghasilkan skor serta rekomendasi yang mudah dipahami.",
  },
  {
    question: "Apakah data mahasiswa aman?",
    answer:
      "Ya. Landing page ini menekankan pendekatan privasi dan keamanan data. Implementasi teknis tetap mengikuti autentikasi dan proteksi data pada aplikasi utama.",
  },
  {
    question: "Apakah hasil analisis bersifat medis?",
    answer:
      "Tidak. Hasil analisis bersifat pendukung pemantauan dan bukan diagnosis medis. Untuk kondisi serius, mahasiswa tetap perlu menghubungi profesional kesehatan.",
  },
  {
    question: "Apakah aplikasi dapat digunakan gratis?",
    answer:
      "Aplikasi dapat disesuaikan untuk kebutuhan capstone, pilot kampus, atau pengembangan lanjutan sesuai kebijakan proyek.",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

function CounterStat({ value, suffix, label }) {
  const [ref, setRef] = useState(null)
  const inView = useInView({ current: ref }, { once: true, margin: "-80px" })
  const count = useMotionValue(0)
  const spring = useSpring(count, { duration: 1800, bounce: 0 })
  const rounded = useTransform(spring, (latest) =>
    value >= 1000 ? Math.round(latest).toLocaleString("id-ID") : Math.round(latest)
  )

  useEffect(() => {
    if (inView) count.set(value)
  }, [count, inView, value])

  return (
    <div ref={setRef} className="rounded-[8px] border border-white/20 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/8">
      <div className="text-3xl font-bold text-slate-950 dark:text-white">
        <motion.span>{rounded}</motion.span>
        {suffix}
      </div>
      <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
    </div>
  )
}

function SectionHeader({ eyebrow, title, body }) {
  return (
    <motion.div
      className="mx-auto max-w-3xl text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={fadeUp}
      transition={{ duration: 0.55 }}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-500">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">{title}</h2>
      {body && <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{body}</p>}
    </motion.div>
  )
}

function HeroIllustration() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-xl"
      initial={{ opacity: 0, scale: 0.94, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.15 }}
    >
      <div className="absolute -left-6 top-6 h-28 w-28 rounded-full bg-cyan-300/40 blur-3xl" />
      <div className="absolute -right-4 bottom-10 h-36 w-36 rounded-full bg-emerald-300/35 blur-3xl" />
      <div className="relative overflow-hidden rounded-[8px] border border-white/25 bg-white/15 p-4 shadow-2xl backdrop-blur-xl">
        <div className="rounded-[8px] bg-slate-950/80 p-4 text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs text-cyan-200">AI Mental Health Monitor</p>
              <h3 className="mt-1 text-lg font-semibold">Student Wellness Dashboard</h3>
            </div>
            <div className="rounded-[8px] bg-emerald-400/15 p-3 text-emerald-300">
              <Brain size={24} />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Mood Score", "78", "text-emerald-300"],
              ["Stress Score", "32", "text-cyan-300"],
              ["Fatigue", "46", "text-amber-200"],
              ["Social", "82", "text-blue-200"],
            ].map(([name, value, color]) => (
              <div key={name} className="rounded-[8px] border border-white/10 bg-white/8 p-3">
                <p className="text-xs text-slate-300">{name}</p>
                <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <svg className="mt-5 h-36 w-full" viewBox="0 0 420 150" role="img" aria-label="Grafik tren stres mingguan">
            <defs>
              <linearGradient id="heroLine" x1="0" x2="1" y1="0" y2="0">
                <stop stopColor="#06B6D4" />
                <stop offset="1" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <path d="M20 120 C70 80 105 92 145 64 C195 28 220 84 265 52 C312 20 345 56 400 30" fill="none" stroke="url(#heroLine)" strokeWidth="8" strokeLinecap="round" />
            <path d="M20 120 C70 80 105 92 145 64 C195 28 220 84 265 52 C312 20 345 56 400 30 L400 150 L20 150 Z" fill="url(#heroLine)" opacity="0.12" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

function ThemeSwitch({ theme, toggleTheme, compact = false }) {
  const isDark = theme === "dark"
  const label = isDark ? "Dark mode aktif" : "Light mode aktif"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Ganti ke light mode" : "Ganti ke dark mode"}
      aria-pressed={isDark}
      title={label}
      className={`inline-flex items-center rounded-[8px] border transition ${
        compact
          ? "h-12 justify-between border-white/15 bg-white/10 px-4 text-white"
          : "h-11 border-slate-200 bg-slate-50 p-1 text-slate-700 hover:border-blue-200 hover:text-blue-700 dark:border-white/10 dark:bg-white/8 dark:text-slate-200 dark:hover:text-cyan-300"
      }`}
    >
      <span className={compact ? "flex items-center gap-2 text-sm font-bold" : "sr-only"}>{label}</span>
      <span className={compact ? "flex items-center gap-2" : "grid grid-cols-2 gap-1"}>
        <span
          className={`inline-flex h-8 items-center gap-1.5 rounded-[8px] px-3 text-xs font-bold transition ${
            !isDark ? "bg-white text-blue-700 shadow-sm" : compact ? "text-slate-300" : "text-slate-500 dark:text-slate-300"
          }`}
        >
          <Sun size={15} />
          {!compact && "Light"}
        </span>
        <span
          className={`inline-flex h-8 items-center gap-1.5 rounded-[8px] px-3 text-xs font-bold transition ${
            isDark ? "bg-slate-950 text-cyan-300 shadow-sm dark:bg-white/12" : compact ? "text-slate-300" : "text-slate-500"
          }`}
        >
          <Moon size={15} />
          {!compact && "Dark"}
        </span>
      </span>
    </button>
  )
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState(0)
  const { theme, toggleTheme } = useTheme()

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] dark:bg-[#080B12] dark:text-white">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#beranda" className="flex items-center gap-3" aria-label="Stress Detector">
            <img src={logo} alt="Stress Detector" className="h-30 w-30 object-contain" />
            {/* <span className="text-lg font-bold text-slate-950 dark:text-white">Cek Stress</span> */}
          </a>

          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-cyan-300">
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
            <Link to="/login" className="rounded-[8px] px-5 py-3 text-sm font-bold text-slate-700 transition hover:text-blue-700 dark:text-slate-200 dark:hover:text-cyan-300">
              Masuk
            </Link>
            <Link to="/register" className="rounded-[8px] bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800">
              Mulai Sekarang
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-slate-200 text-slate-700 lg:hidden dark:border-white/10 dark:text-white"
            aria-label="Buka menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <motion.div
          className="fixed inset-0 z-[60] bg-slate-950/96 px-6 py-5 text-white lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Stress Detector" className="h-10 w-10 object-contain" />
              <span className="text-lg font-bold">Stress Detector</span>
            </div>
            <button type="button" onClick={() => setMenuOpen(false)} className="rounded-[8px] border border-white/15 p-3" aria-label="Tutup menu">
              <X size={20} />
            </button>
          </div>
          <div className="mt-14 flex flex-col gap-7">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="text-3xl font-bold">
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-12 grid gap-3">
            <ThemeSwitch theme={theme} toggleTheme={toggleTheme} compact />
            <Link to="/login" className="rounded-[8px] border border-white/15 px-5 py-4 text-center font-bold">
              Masuk
            </Link>
            <Link to="/register" className="rounded-[8px] bg-cyan-400 px-5 py-4 text-center font-bold text-slate-950">
              Mulai Sekarang
            </Link>
          </div>
        </motion.div>
      )}

      <section id="beranda" className="relative bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#06B6D4] pt-32 text-white">
        <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute right-10 top-36 h-20 w-20 rounded-full border border-white/20 bg-white/10" />
        <div className="absolute bottom-16 left-8 h-14 w-14 rounded-[8px] border border-white/20 bg-white/10 rotate-12" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur">
              <HeartPulse size={16} />
              Sistem Deteksi Tingkat Stres Mahasiswa berbasis AI
            </div>
            <h1 className="mt-7 max-w-4xl text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
              Deteksi Tingkat Stres Mahasiswa dengan AI
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-50">
              Pantau kondisi mental mahasiswa melalui aktivitas harian, penggunaan media sosial, tingkat kelelahan, dan pola perilaku secara otomatis.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="rounded-[8px] bg-white px-6 py-4 text-center font-bold text-blue-800 shadow-xl shadow-blue-950/20 transition hover:bg-cyan-50">
                Coba Sekarang
              </Link>
              <a href="#fitur" className="rounded-[8px] border border-white/25 bg-white/10 px-6 py-4 text-center font-bold text-white backdrop-blur transition hover:bg-white/18">
                Pelajari Lebih Lanjut
              </a>
            </div>
          </motion.div>

          <HeroIllustration />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-4 px-4 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <CounterStat key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section id="fitur" className="px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Fitur Unggulan"
          title="Pemantauan stres yang jelas, cepat, dan siap ditindaklanjuti"
          body="Stress Detector menggabungkan input aktivitas, analitik perilaku, dan visualisasi modern untuk membantu kampus memahami kondisi mahasiswa dengan lebih manusiawi."
        />
        <div className="mx-auto mt-12 grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.article
                key={feature.title}
                className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/8 dark:border-white/10 dark:bg-white/6 dark:hover:border-cyan-300/35"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.05 }}
              >
                <div className="inline-flex rounded-[8px] bg-blue-50 p-3 text-blue-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                  <Icon size={24} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{feature.body}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section id="cara-kerja" className="bg-white px-4 py-24 dark:bg-white/5 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Cara Kerja"
          title="Cara Kerja Stress Detector"
          body="Alur sederhana untuk mengubah data aktivitas mahasiswa menjadi insight yang mudah dibaca."
        />
        <div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.article
                key={step.title}
                className="relative rounded-[8px] border border-slate-200 bg-[#F8FAFC] p-6 dark:border-white/10 dark:bg-slate-950/60"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-cyan-500 text-white">
                  <Icon size={22} />
                </div>
                <p className="mt-6 text-sm font-bold text-blue-700 dark:text-cyan-300">Langkah {index + 1}</p>
                <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.body}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section id="tentang" className="px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Dashboard Preview"
          title="Satu dashboard untuk membaca kondisi mahasiswa"
          body="Mockup berikut memperlihatkan ringkasan skor, tren mingguan, dan riwayat analisis dalam tampilan SaaS yang bersih."
        />
        <motion.div
          className="mx-auto mt-12 max-w-6xl rounded-[8px] border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-950/10 dark:border-white/10 dark:bg-slate-950"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
        >
          <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[
                ["Mood Score", "78%", "Stabil", "bg-emerald-500"],
                ["Tingkat Kelelahan", "46%", "Sedang", "bg-amber-400"],
                ["Social Media Score", "82%", "Sehat", "bg-cyan-500"],
                ["Stress Score", "32%", "Rendah", "bg-blue-600"],
              ].map(([name, score, status, color]) => (
                <div key={name} className="rounded-[8px] border border-slate-200 p-4 dark:border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{name}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-200">{status}</span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">{score}</p>
                  <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                    <div className={`h-2 rounded-full ${color}`} style={{ width: score }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[8px] border border-slate-200 p-5 dark:border-white/10">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white">Grafik Tren Mingguan</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Perkembangan skor stres tujuh hari terakhir.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-[8px] bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <TrendingUp size={16} />
                  Membaik 18%
                </div>
              </div>
              <svg className="mt-8 h-64 w-full" viewBox="0 0 720 260" role="img" aria-label="Grafik dashboard tren mingguan">
                <defs>
                  <linearGradient id="dashboardLine" x1="0" x2="1" y1="0" y2="0">
                    <stop stopColor="#2563EB" />
                    <stop offset="1" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                {[40, 90, 140, 190, 240].map((y) => (
                  <line key={y} x1="20" x2="700" y1={y} y2={y} stroke="currentColor" className="text-slate-200 dark:text-white/10" />
                ))}
                <path d="M30 200 C100 130 150 170 215 110 C290 42 345 116 415 88 C500 54 540 124 610 70 C650 42 675 52 700 34" fill="none" stroke="url(#dashboardLine)" strokeWidth="8" strokeLinecap="round" />
              </svg>
              <div className="mt-4 rounded-[8px] bg-slate-50 p-4 dark:bg-white/5">
                <h4 className="font-bold text-slate-950 dark:text-white">Riwayat Analisis</h4>
                <div className="mt-3 grid gap-3">
                  {["Stres rendah setelah jadwal tidur membaik", "Kelelahan naik saat deadline akademik", "Aktivitas sosial stabil selama akhir pekan"].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="shrink-0 text-emerald-500" size={18} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="bg-white px-4 py-24 dark:bg-white/5 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Manfaat" title="Siapa yang Cocok Menggunakan Stress Detector?" />
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
          {audiences.map((audience, index) => {
            const Icon = audience.icon
            return (
              <motion.article
                key={audience.title}
                className="rounded-[8px] border border-slate-200 bg-[#F8FAFC] p-7 text-center dark:border-white/10 dark:bg-slate-950/60"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[8px] bg-blue-700 text-white">
                  <Icon size={25} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">{audience.title}</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{audience.body}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section id="faq" className="px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Pertanyaan yang Sering Diajukan" />
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-slate-200 rounded-[8px] border border-slate-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/6">
          {faqs.map((faq, index) => (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-bold text-slate-950 dark:text-white"
              >
                {faq.question}
                <ChevronDown className={`shrink-0 transition ${activeFaq === index ? "rotate-180" : ""}`} size={20} />
              </button>
              {activeFaq === index && (
                <motion.p className="px-5 pb-5 leading-7 text-slate-600 dark:text-slate-300" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  {faq.answer}
                </motion.p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[8px] bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#06B6D4] px-6 py-16 text-center text-white shadow-2xl shadow-blue-950/20 sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[8px] bg-white/15">
            <Target size={26} />
          </div>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-extrabold sm:text-4xl">Mulai Pantau Tingkat Stres Mahasiswa Sekarang</h2>
          <p className="mx-auto mt-4 max-w-2xl text-blue-50">
            Dapatkan insight yang lebih baik mengenai kondisi mental mahasiswa menggunakan teknologi AI.
          </p>
          <Link to="/register" className="mt-8 inline-flex rounded-[8px] bg-white px-7 py-4 font-bold text-blue-800 transition hover:bg-cyan-50">
            Mulai Sekarang
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-12 dark:border-white/10 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Stress Detector" className="h-10 w-10 object-contain" />
              <span className="text-lg font-bold text-slate-950 dark:text-white">Stress Detector</span>
            </div>
            <p className="mt-4 max-w-md leading-7 text-slate-600 dark:text-slate-300">
              Platform deteksi tingkat stres mahasiswa berbasis AI untuk membantu monitoring kesehatan mental secara lebih efektif.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-950 dark:text-white">Menu</h3>
            <div className="mt-4 grid gap-3">
              {navItems.slice(0, 4).map((item) => (
                <a key={item.href} href={item.href} className="text-slate-600 transition hover:text-blue-700 dark:text-slate-300 dark:hover:text-cyan-300">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-950 dark:text-white">Kontak</h3>
            <div className="mt-4 grid gap-3 text-slate-600 dark:text-slate-300">
              <a href="mailto:hello@stressdetector.app" className="inline-flex items-center gap-2 transition hover:text-blue-700 dark:hover:text-cyan-300">
                <Mail size={16} />
                hello@stressdetector.app
              </a>
              <a href="https://github.com/Zetday/student-stress-detector" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-blue-700 dark:hover:text-cyan-300">
                <GitBranch size={16} />
                Github Project
              </a>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-7xl text-sm text-slate-500 dark:text-slate-400">&copy; 2026 Stress Detector</p>
      </footer>
    </main>
  )
}
