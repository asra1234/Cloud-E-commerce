import React from "react";

export default function AdminEmbed() {
  const adminUrl =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_ADMIN_URL
      ? import.meta.env.VITE_ADMIN_URL
      : "/admin/";

  return (
    <div className="w-full h-[80vh] md:h-[90vh] bg-gray-50 rounded shadow overflow-hidden">
      <iframe
        title="Admin Dashboard"
        src={adminUrl}
        className="w-full h-full border-0"
        aria-label="Admin dashboard iframe"
      />
    </div>
  );
}
