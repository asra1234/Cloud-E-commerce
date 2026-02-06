import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex w-full min-h-screen">
        <Sidebar />

        <div className="flex-1 bg-gray-50 min-h-screen overflow-auto">
          <Navbar />
          <main className="p-6 max-w-full h-full">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
