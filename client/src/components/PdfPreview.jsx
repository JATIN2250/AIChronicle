import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload } from 'react-icons/fi';

const PdfPreview = ({ pdfUrl, onClose }) => {
  // Backend port 3001
  const BACKEND_URL = 'http://localhost:3001';
  const fullPdfUrl = `${BACKEND_URL}${pdfUrl}`;

  return (
    <AnimatePresence>
      {pdfUrl && (
        <motion.div
          className="h-full w-1/2 flex flex-col bg-slate-800 border-l border-slate-700"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: "0%", opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 250 }}
        >
          {/* --- PDF Header --- */}
          <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-700 flex-shrink-0">
            <h3 className="text-white font-semibold">News Report</h3>
            <div className="flex gap-4">
              {/* Download Button */}
              <a
                href={fullPdfUrl}
                download={`News_Report_${new Date().toISOString().split('T')[0]}.pdf`}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Download PDF"
              >
                <FiDownload size={20} />
              </a>
              {/* YEH HAI CLOSE BUTTON */}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Close Preview"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* --- PDF Viewer --- */}
          <div className="flex-grow w-full h-full">
            <iframe
              src={fullPdfUrl}
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PdfPreview;