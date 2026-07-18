
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import UserHeader from "./customer-header.jsx";
import UserFooter from "./customer-footer.jsx";
import CustomerSidebar from "./customer-sidebar.jsx";

function UserLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setOpenSidebar(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {openSidebar && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpenSidebar(false)}
        />
      )}

      {/* Fixed Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <UserHeader setOpen={setOpenSidebar} />
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <CustomerSidebar />
        </div>

        {/* Mobile Drawer Sidebar */}
        {isMobile && (
          <div
            className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 lg:hidden ${
              openSidebar ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <CustomerSidebar open={openSidebar} setOpen={setOpenSidebar} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <UserFooter />
      </footer>
    </div>
  );
}

export default UserLayout;
