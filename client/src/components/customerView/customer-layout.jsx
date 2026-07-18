
import { Outlet } from "react-router-dom";
import UserHeader from "./customer-header.jsx";
import UserFooter from "./customer-footer.jsx";
import CustomerSidebar from "./customer-sidebar.jsx";

function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <UserHeader />
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <CustomerSidebar />

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
