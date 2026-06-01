import { motion } from "framer-motion";

interface TableProps {
  rows: any[];
  columns: any[];
  heading: string;
  rowHeight?: number;
}

const Table = ({ rows, columns, heading, rowHeight = 52 }: TableProps) => {
  return (
    <div className="w-full h-full min-h-0 flex flex-col p-4 md:p-6 select-none font-sans min-w-0">
      {/* --- PREMIUM DATA WORKSPACE WORK TRACK --- */}
      <div className="w-full h-full flex flex-col bg-white dark:bg-[#0e0e12]/60 backdrop-blur-xl border border-neutral-200/60 dark:border-white/[0.04] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden min-w-0">
        {/* Header Title Section Frame */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-neutral-100 dark:border-white/[0.03] flex-shrink-0 min-w-0">
          <div className="space-y-1 min-w-0">
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-[#ececec] block truncate"
            >
              {heading}
            </motion.h2>
            <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 block truncate">
              Review systemic network database metrics and data records logs.
            </p>
          </div>

          {/* Dynamic Records Registry Counter Tag */}
          <div className="flex-shrink-0 ml-4">
            <span className="text-[10px] font-bold font-mono tracking-tight px-2 py-1 rounded-md bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/[0.04] text-neutral-500 dark:text-neutral-400">
              REGISTRY: {rows.length} NODES
            </span>
          </div>
        </div>

        {/* --- DEFENSIVE DATA RAILS VIEWPORT --- */}
        <div className="flex-grow overflow-auto min-w-0 w-full scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-0 table-fixed">
            {/* Elegant Low-Contrast Table Head */}
            <thead className="bg-neutral-50/70 dark:bg-[#131316]/40 border-b border-neutral-100 dark:border-white/[0.03] sticky top-0 z-20 backdrop-blur-md">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.field}
                    style={{ width: col.width }}
                    className="px-6 py-3.5 text-[11px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase select-none truncate"
                  >
                    {col.headerName}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Seamless Content Rows Base Deck */}
            <tbody className="divide-y divide-neutral-100 dark:divide-white/[0.02]">
              {rows.length > 0 ? (
                rows.map((row, idx) => (
                  <motion.tr
                    key={row.id || idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                      delay: Math.min(idx * 0.02, 0.15),
                    }}
                    className="group/row hover:bg-neutral-50/50 dark:hover:bg-white/[0.01] transition-colors"
                    style={{ height: rowHeight }}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.field}
                        className="px-6 text-[13px] font-medium text-neutral-600 dark:text-neutral-400 truncate"
                      >
                        {col.renderCell
                          ? col.renderCell({ row })
                          : (row[col.field] ?? (
                              <span className="text-neutral-300 dark:text-neutral-700 font-mono">
                                —
                              </span>
                            ))}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-16 text-neutral-400 dark:text-neutral-500 text-xs font-medium"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="tracking-wide">
                        No active catalog nodes populated
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
