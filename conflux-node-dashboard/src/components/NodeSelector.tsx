"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const nodes = [
  { name: "Conflux Mainnet", url: "https://main.confluxrpc.com" },
  { name: "Conflux Testnet", url: "https://test.confluxrpc.com" },
];

interface NodeSelectorProps {
  onSelect: (url: string) => void;
  selectedUrl: string;
}

export function NodeSelector({ onSelect, selectedUrl }: NodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedNode = nodes.find((node) => node.url === selectedUrl);

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-auto bg-gray-800/50 border border-gray-700/50 text-white px-4 py-2 rounded-lg flex items-center justify-between"
      >
        <span>{selectedNode ? selectedNode.name : "Select a Node"}</span>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg"
          >
            {nodes.map((node) => (
              <div
                key={node.url}
                onClick={() => {
                  onSelect(node.url);
                  setIsOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
              >
                {node.name}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
