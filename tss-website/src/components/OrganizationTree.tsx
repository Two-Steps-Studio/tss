"use client";

import React from "react";
import Tree from "react-d3-tree";
import { Users, Mail, MapPin, Badge } from "lucide-react";

// Dane hierarchiczne zespołu
const orgChart = {
  name: "CEO / Owner",
  attributes: { role: "Owner", email: "owner@tss.com" },
  children: [
    {
      name: "Management",
      attributes: { role: "Manager", email: "manager@tss.com" },
      children: [
        {
          name: "Development Team",
          attributes: { department: "DEV", email: "dev@tss.com" },
          children: [
            {
              name: "Frontend Lead",
              attributes: { role: "Lead", email: "frontend@tss.com" },
              children: [
                { name: "Frontend Developer 1" },
                { name: "Frontend Developer 2" },
              ],
            },
            {
              name: "Backend Lead",
              attributes: { role: "Lead", email: "backend@tss.com" },
              children: [
                { name: "Backend Developer 1" },
                { name: "Backend Developer 2" },
              ],
            },
          ],
        },
        {
          name: "Design Team",
          attributes: { department: "Design", email: "design@tss.com" },
          children: [
            { name: "UI/UX Designer 1" },
            { name: "UI/UX Designer 2" },
          ],
        },
        {
          name: "Production Team",
          attributes: { department: "Production", email: "prod@tss.com" },
          children: [
            { name: "Producer 1" },
            { name: "Producer 2" },
          ],
        },
      ],
    },
  ],
};


const CustomTreeNode = ({ node }: { node: any }) => (
  <div className="group">
    <div className="node-container p-4 rounded-lg border border-zinc-700/50 bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors backdrop-blur-sm">
      {/* Avatar / Ikona */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center mb-3 border border-zinc-500">
        {node.data.attributes?.role ? (
          <Badge className="text-white" />
        ) : (
          <Users className="text-zinc-300" />
        )}
      </div>

      {/* Nazwa */}
      <div className="text-center mb-2">
        <h3 className="font-bold text-zinc-100 text-sm">{node.data.name}</h3>
      </div>

      {/* Atrybuty */}
      {node.data.attributes && (
        <div className="space-y-1.5 text-center">
          {node.data.attributes.role && (
            <div className="text-xs text-zinc-400">
              <span className="inline-block px-2 py-0.5 rounded bg-zinc-700/50 text-zinc-300 text-[10px] font-medium">
                {node.data.attributes.role}
              </span>
            </div>
          )}
          {node.data.attributes.department && (
            <div className="text-xs text-zinc-400">
              {node.data.attributes.department}
            </div>
          )}
          {node.data.attributes.email && (
            <div className="flex items-center justify-center gap-1 text-xs text-zinc-400 mt-2">
              <Mail size={10} />
              <span className="truncate max-w-[150px]">{node.data.attributes.email}</span>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

export default function OrganizationTree() {
  return (
    <div className="w-full overflow-auto bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
      <div id="treeWrapper" style={{ width: "100%", height: "500px" }}>
        <Tree
          data={orgChart}
          renderCustomNodeElement={CustomTreeNode}
          collapsible
          collapsedLabel="▼"
          expandedLabel="▶"
          expandAllOnMount
        />
      </div>
    </div>
  );
}
