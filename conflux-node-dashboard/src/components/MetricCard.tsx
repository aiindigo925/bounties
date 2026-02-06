"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  isWarning?: boolean;
}

export function MetricCard({ label, value, icon, isWarning = false }: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg text-white flex flex-col items-start",
        isWarning ? "border-yellow-500/50 border" : "border-gray-700/50 border"
      )}
    >
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-lg font-medium text-gray-400">{label}</h3>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className={cn("text-4xl font-bold", isWarning ? "text-yellow-400" : "text-green-400")}>
        {value}
      </p>
    </motion.div>
  );
}
