import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-t-2 border-r-2 border-[var(--color-general)] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="text-[var(--color-general)] animate-pulse" size={32} />
        </div>
      </div>
    </div>
  );
}
