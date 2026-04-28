"use client";

import React, { useMemo } from "react";
import Tree from "react-d3-tree";
import { Users, Mail, MapPin, Badge } from "lucide-react";

interface OrgNode extends React.D3Tree.Node {
  name: string;
  attributes?: {
    role?: string;
    email?: string;
    department?: string;
  };
}

interface OrgNodeRenderProps {
  node: OrgNode;
  depth: number;
  expand: boolean;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}

const OrgNode = ({ node, depth, expandedIds, toggleExpand }: OrgNodeRenderProps) => {
  const { name, attributes } = node;

  const hasChildren = Array.isArray(attributes?.members) && attributes.members.length > 0;

  // Use expandedIds prop directly instead of internal state
  const isOpen = expandedIds.has(name);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpand(name);
  };

  return (
    <Tree.Node
      key={name}
      ref={(ref) => {
        if (ref) {
          if (!isOpen && hasChildren) {
            // Use data-* attribute for click handler instead of direct assignment
            ref.element.setAttribute("data-toggle", "expand");
          }
        }
      }}
    >
      <Tree.Styles.Node />

      <div className="tree-item-container">
        <div className={`flex items-center ${hasChildren ? "cursor-pointer hover:bg-accent/10" : ""}`}>
          <div
            className={`w-5 h-5 flex items-center justify-center mr-2 ${
              hasChildren ? "opacity-60 hover:opacity-100" : "opacity-0"
            }`}
            onClick={toggle}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 4a1 1 0 00-1 1v3h-2a1 1 0 00-1 1v3a1 1 0 001 1h14a1 1 0 001-1v-3a1 1 0 00-1-1H9v-3a1 1 0 00-1-1z" />
            </svg>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${attributes?.role === "CEO" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}>
              {attributes?.role === "CEO" ? <Users className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-lg">{name}</span>
              {attributes?.role && (
                <span className="text-xs text-gray-500">{attributes.role}</span>
              )}
            </div>
          </div>
        </div>

        {hasChildren && (
          <>
            <Tree.Styles.Edge />
            <Tree.NodeGroup
              label=""
              expand={isOpen}
              nodeIds={Array.isArray(attributes?.members) ? attributes.members : []}
              onToggle={toggleExpand}
            >
              {Array.isArray(attributes?.members) &&
                attributes.members.map((memberName) => (
                  <OrgNode
                    key={memberName}
                    node={{ name: memberName }}
                    depth={depth + 1}
                    expandedIds={expandedIds}
                    toggleExpand={toggleExpand}
                  />
                ))}
            </Tree.NodeGroup>
          </>
        )}
      </div>
    </Tree.Node>
  );
};

interface OrganizationTreeProps {
  orgData: OrgNode;
}

export function OrganizationTree({ orgData }: OrganizationTreeProps) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set([orgData.name]));

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="w-full overflow-auto">
      <Tree.Tree
        data={orgData}
        style={{ fontSize: "14px", defaultExpandDepth: 1, defaultExpand: false }}
        node={OrgNode}
        onNodeClick={() => {}} // Removed unused click handler
      />
    </div>
  );
}

export default OrganizationTree;
