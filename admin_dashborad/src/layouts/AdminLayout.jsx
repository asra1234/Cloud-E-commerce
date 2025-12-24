import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-200 p-6">
      <div className="flex rounded-3xl overflow-hidden shadow-2xl bg-white">
        <Sidebar />

        <div className="flex-1 bg-gray-50">
          <Navbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
