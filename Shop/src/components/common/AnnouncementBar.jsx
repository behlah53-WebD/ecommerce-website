import React from "react";

export const AnnouncementBar = () => {
  return (
    <div className="bg-primary-600 dark:bg-primary-700 py-2 text-center text-xs sm:text-sm font-medium text-white transition-colors">
      Free shipping on orders over $100 | Use code{" "}
      <span className="font-bold underline decoration-white/50">ZYRA20</span>{" "}
      for 20% off
    </div>
  );
};
