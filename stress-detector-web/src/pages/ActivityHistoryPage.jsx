import { useEffect, useMemo, useState } from "react";
import Layout from "../../layouts/Layout";
import ActivityHistoryFilters from "../components/ActivityHistory/ActivityHistoryFilters";
import ActivityHistoryList from "../components/ActivityHistory/ActivityHistoryList";
import ActivityHistoryPagination from "../components/ActivityHistory/ActivityHistoryPagination";
import { getActivityHistory } from "../services/activityService";
import { useUser } from "../contexts/UserContext";

function ActivityHistoryPage() {
  const { user } = useUser();
  const [activityHistoryData, setActivityHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const response = await getActivityHistory();
      
      if (isMounted) {
        if (response.error) {
          setError(response.message);
        } else {
          setActivityHistoryData(response.data || []);
        }
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

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
  }, [activityHistoryData, statusFilter, dateFilter, sortOption]);

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
    <Layout title="Riwayat Aktivitas" name={user.fullname} role={user.role}>
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

          {loading ? (
            <div className="py-12 text-center text-gray-500 theme-muted">Memuat riwayat aktivitas...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-gray-500 theme-muted">Belum ada riwayat aktivitas yang sesuai.</div>
          ) : (
            <>
              <ActivityHistoryList items={currentPageData} /> 

              <ActivityHistoryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                from={from}
                to={to}
                total={filteredHistory.length}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ActivityHistoryPage;
