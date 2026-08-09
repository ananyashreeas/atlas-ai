"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

type MindMapNode = {
  id: string;
  label: string;
  type: "central" | "main" | "sub";
};

type MindMapEdge = {
  source: string;
  target: string;
  label: string;
};

type MindMapData = {
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
};

type MindMapProps = {
  data: MindMapData;
};

function MindMapCanvas({ data }: MindMapProps) {
  const nodes: Node[] = data.nodes.map((node, index) => {
    let x = 0;
    let y = 0;

    if (node.type === "central") {
      x = 400;
      y = 250;
    } else if (node.type === "main") {
      const mainNodes = data.nodes.filter(
        (item) => item.type === "main"
      );

      const mainIndex = mainNodes.findIndex(
        (item) => item.id === node.id
      );

      const angle =
        (mainIndex / Math.max(mainNodes.length, 1)) *
        Math.PI *
        2;

      x = 400 + Math.cos(angle) * 350;
      y = 250 + Math.sin(angle) * 220;
    } else {
      const parentEdge = data.edges.find(
        (edge) => edge.target === node.id
      );

      const parentIndex = data.nodes.findIndex(
        (item) => item.id === parentEdge?.source
      );

      const parentNode =
        data.nodes[parentIndex];

      const mainNodes = data.nodes.filter(
        (item) => item.type === "main"
      );

      const mainIndex = mainNodes.findIndex(
        (item) => item.id === parentNode?.id
      );

      const angle =
        (mainIndex / Math.max(mainNodes.length, 1)) *
        Math.PI *
        2;

      const siblingNodes = data.nodes.filter(
        (item) => {
          const edge = data.edges.find(
            (e) => e.target === item.id
          );

          return (
            item.type === "sub" &&
            edge?.source === parentNode?.id
          );
        }
      );

      const siblingIndex = siblingNodes.findIndex(
        (item) => item.id === node.id
      );

      x =
        400 +
        Math.cos(angle) * 600 +
        (siblingIndex % 2) * 80;

      y =
        250 +
        Math.sin(angle) * 400 +
        Math.floor(siblingIndex / 2) * 100;
    }

    let background = "#0f172a";
    let border = "#334155";

    if (node.type === "central") {
      background = "#facc15";
      border = "#facc15";
    }

    if (node.type === "main") {
      background = "#1e293b";
      border = "#facc15";
    }

    if (node.type === "sub") {
      background = "#020617";
      border = "#475569";
    }

    return {
      id: node.id,
      position: { x, y },
      data: {
        label: node.label,
      },
      style: {
        background,
        color:
          node.type === "central"
            ? "#020617"
            : "#e2e8f0",
        border: `2px solid ${border}`,
        borderRadius: 16,
        padding: "14px 18px",
        minWidth:
          node.type === "central"
            ? 180
            : 150,
        textAlign: "center" as const,
        fontWeight:
          node.type === "central"
            ? 700
            : 500,
        boxShadow:
          node.type === "central"
            ? "0 0 25px rgba(250,204,21,0.25)"
            : "none",
      },
    };
  });

  const edges: Edge[] = data.edges.map(
    (edge, index) => ({
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: false,
      style: {
        stroke: "#64748b",
      },
      labelStyle: {
        fill: "#94a3b8",
        fontSize: 11,
      },
      labelBgStyle: {
        fill: "#020617",
      },
    })
  );

  return (
    <div className="w-full h-[650px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-left"
      >
        <Background gap={24} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (
              node.id === data.nodes[0]?.id
            ) {
              return "#facc15";
            }

            return "#475569";
          }}
        />
      </ReactFlow>
    </div>
  );
}

export default function MindMap({
  data,
}: MindMapProps) {
  return (
    <ReactFlowProvider>
      <MindMapCanvas data={data} />
    </ReactFlowProvider>
  );
}