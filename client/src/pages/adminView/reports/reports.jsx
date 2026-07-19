import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminReports,
  fetchAdminUserReports,
  reviewAdminUserReport,
} from "@/redux/slices/adminSlice";

const AdminReportsPage = () => {
  const dispatch = useDispatch();
  const { reports, userReports } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminReports());
    dispatch(fetchAdminUserReports());
  }, [dispatch]);

  const handleReview = (reportId, status) => {
    dispatch(reviewAdminUserReport({ reportId, status }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">Administrative summaries for subscriptions, payment health, and open user reports.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Premium users</p>
          <p className="mt-2 text-2xl font-bold">{reports?.premiumUsers ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">VIP users</p>
          <p className="mt-2 text-2xl font-bold">{reports?.vipUsers ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending payments</p>
          <p className="mt-2 text-2xl font-bold">{reports?.pendingPayments ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm md:col-span-3">
          <p className="text-sm text-muted-foreground">Open user reports</p>
          <p className="mt-2 text-2xl font-bold">{reports?.openReports ?? 0}</p>
        </div>
      </div>

      <section className="grid gap-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Open User Reports</h2>
          </div>
          {userReports?.length ? (
            <div className="space-y-3">
              {userReports.map((report) => (
                <div key={report.id} className="rounded-lg border p-4">
                  <div className="grid gap-2 md:grid-cols-5">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Reporter</p>
                      <p>{report.reporter?.name ?? "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Reported user</p>
                      <p>{report.reportedUser?.name ?? "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Reason</p>
                      <p>{report.reason}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Date</p>
                      <p>{new Date(report.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="space-x-2 flex flex-wrap items-center">
                      <button
                        className="rounded-md border px-3 py-2 text-sm text-white bg-sky-600 hover:bg-sky-700"
                        onClick={() => handleReview(report.id, "reviewed")}
                      >
                        Mark Reviewed
                      </button>
                      <button
                        className="rounded-md border px-3 py-2 text-sm text-white bg-rose-600 hover:bg-rose-700"
                        onClick={() => handleReview(report.id, "dismissed")}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No open reports at this time.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminReportsPage;
