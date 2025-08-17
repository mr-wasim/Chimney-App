import React, { useEffect } from 'react';

export default function Toast({ show, message, onClose }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 2200);
      return () => clearTimeout(t);
    }
  }, [show]);
  if (!show) return null;
  return (
    <div className="fixed top-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-xl shadow-lg">
      {message}
    </div>
  )
}
