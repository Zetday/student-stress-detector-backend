import { useMemo, useState } from "react";
import Layout from "../../layouts/Layout";
import ActivityHistoryFilters from "../components/ActivityHistory/ActivityHistoryFilters";
import ActivityHistoryList from "../components/ActivityHistory/ActivityHistoryList";
import ActivityHistoryPagination from "../components/ActivityHistory/ActivityHistoryPagination";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days) {
  return new Date(Date.now() - days * DAY_MS);
}

const activityHistoryData = [
  {
    id: 1,
    datetime: daysAgo(1),
    preview: "Terdapat indikasi tekanan akademik meningkat karena deadline tinggi dan tidur kurang...",
    stressScore: 72,
    scoreLabel: "Tinggi",
    status: "Selesai",
  },
  {
    id: 2,
    datetime: daysAgo(2),
    preview: "Jurnal belum selesai diisi. Lanjutkan pengisian untuk mendapatkan hasil analisis...",
    stressScore: 0,
    scoreLabel: "Belum selesai",
    status: "Draft",
  },
  {
    id: 3,
    datetime: daysAgo(5),
    preview: "Terdapat pola beban tugas tinggi dan deadline padat yang berkontribusi pada kenaikan stres...",
    stressScore: 72,
    scoreLabel: "Tinggi",
    status: "Terlambat",
  },
  {
    id: 4,
    datetime: daysAgo(8),
    preview: "Jurnal aktif telah selesai. Sistem merekomendasikan evaluasi jadwal belajar besok...",
    stressScore: 55,
    scoreLabel: "Sedang",
    status: "Selesai",
  },
  {
    id: 5,
    datetime: daysAgo(15),
    preview: "Tidur cukup semalam membantu menurunkan level stress, namun beban tugas masih perlu dikontrol...",
    stressScore: 48,
    scoreLabel: "Sedang",
    status: "Selesai",
  },
  {
    id: 6,
    datetime: daysAgo(23),
    preview: "Draft jurnal ditemukan. Lengkapi catatan suasana hati dan deadline agar analisis lebih akurat...",
    stressScore: 0,
    scoreLabel: "Belum selesai",
    status: "Draft",
  },
  {
    id: 7,
    datetime: daysAgo(32),
    preview: "Pengisian terlalu terlambat. Data ini masih bisa digunakan untuk memantau tren stres bulan lalu...",
    stressScore: 68,
    scoreLabel: "Tinggi",
    status: "Terlambat",
  },
  {
    id: 8,
    datetime: daysAgo(42),
    preview: "Aktivitas dan pola tidur stabil. Rekomendasi: pertahankan ritme istirahat sebelum tengah malam...",
    stressScore: 36,
    scoreLabel: "Rendah",
    status: "Selesai",
  },
  {
    id: 9,
    datetime: daysAgo(55),
    preview: "Deadline mendadak membuat jurnal selesai terlambat. Perkirakan kembali durasi pengerjaan tugas...",
    stressScore: 77,
    scoreLabel: "Tinggi",
    status: "Terlambat",
  },
  {
    id: 10,
    datetime: daysAgo(72),
    preview: "Jurnal selesai, namun kecenderungan kelelahan terlihat. Prioritaskan jeda singkat di tengah sesi belajar...",
    stressScore: 61,
    scoreLabel: "Sedang",
    status: "Selesai",
  },
  {
    id: 11,
    datetime: daysAgo(90),
    preview: "Draft lama ditemukan. Data ini belum sempurna karena beberapa kolom belum diisi...",
    stressScore: 0,
    scoreLabel: "Belum selesai",
    status: "Draft",
  },
  {
    id: 12,
    datetime: daysAgo(110),
    preview: "Aktivitas berhasil diselesaikan dengan ritme yang lebih baik. Tetap catat beban tugas harian...",
    stressScore: 34,
    scoreLabel: "Rendah",
    status: "Selesai",
  },
];

function ActivityHistoryPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const filteredHistory = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now.getTime());

    if (dateFilter === "7-day") {
      startDate.setDate(now.getDate() - 7);
    } else if (dateFilter === "this-month") {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === "last-month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate.setTime(lastMonth.getTime());
    } else if (dateFilter === "3-month") {
      startDate.setDate(now.getDate() - 90);
    }

    return activityHistoryData
      .filter((item) => {
        const matchesStatus =
          statusFilter === "all" || item.status.toLowerCase() === statusFilter;

        if (dateFilter === "all") {
          return matchesStatus;
        }

        if (dateFilter === "last-month") {
          const itemMonth = item.datetime.getMonth();
          const itemYear = item.datetime.getFullYear();
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return (
            matchesStatus &&
            itemMonth === lastMonth.getMonth() &&
            itemYear === lastMonth.getFullYear()
          );
        }

        return matchesStatus && item.datetime >= startDate;
      })
      .sort((a, b) => {
        if (sortOption === "newest") {
          return b.datetime - a.datetime;
        }
        if (sortOption === "oldest") {
          return a.datetime - b.datetime;
        }
        if (sortOption === "highest-score") {
          return b.stressScore - a.stressScore;
        }
        if (sortOption === "lowest-score") {
          return a.stressScore - b.stressScore;
        }
        return 0;
      });
  }, [statusFilter, dateFilter, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const currentPageData = filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const from = filteredHistory.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(filteredHistory.length, currentPage * pageSize);

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDateFilter = (value) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  const handleSortOption = (value) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  return (
    <Layout title="Riwayat Aktivitas" name="User" role="User">
      <div className="space-y-6 text-sm">
          <p className="theme-muted max-w-2xl text-sm">
            Pantau riwayat jurnal harian yang telah Anda isi sebelumnya.
          </p>
        

        <div className="space-y-6 rounded-3xl p6">

          <ActivityHistoryFilters
            statusFilter={statusFilter}
            setStatusFilter={handleStatusFilter}
            dateFilter={dateFilter}
            setDateFilter={handleDateFilter}
            sortOption={sortOption}
            setSortOption={handleSortOption}
          />

          <ActivityHistoryList items={currentPageData} />

          <ActivityHistoryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            from={from}
            to={to}
            total={filteredHistory.length}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </Layout>
  );
}

export default ActivityHistoryPage;

