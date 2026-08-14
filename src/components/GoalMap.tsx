import { Card } from '@heroui/react'
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import { Check, Flag, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Goal } from '../lib/types'
import { DifficultyPill, TimePill } from './StatusPill'

interface GoalMapData extends Record<string, unknown> {
  label: string
  kind: 'goal' | 'milestone' | 'task'
  progress: number
  status: string
  difficulty?: 'TINY' | 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC'
  durationMinutes?: number | null
  description?: string | null
}

type GoalNode = Node<GoalMapData>

function MapNode({ data, selected }: NodeProps<GoalNode>) {
  return (
    <div className={`goal-map-node map-${data.kind} node-${data.status.toLowerCase()} ${selected ? 'node-selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div className="map-node-icon">
        {data.status === 'COMPLETED' ? <Check size={14} /> : data.kind === 'goal' ? <Target size={15} /> : <Flag size={14} />}
      </div>
      <div className="map-node-copy">
        <span>{data.kind}</span>
        <strong>{data.label}</strong>
      </div>
      {data.kind !== 'task' && <b>{data.progress}%</b>}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const nodeTypes = { kaizen: MapNode }

export function GoalMap({ goal }: { goal: Goal }) {
  const [selected, setSelected] = useState<GoalMapData | null>(null)
  const { nodes, edges } = useMemo(() => buildMap(goal), [goal])

  return (
    <div className="goal-map-wrap">
      <div className="goal-map-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.16, minZoom: 0.55 }}
          minZoom={0.35}
          maxZoom={1.4}
          nodesDraggable={false}
          nodesConnectable={false}
          onNodeClick={(_, node) => setSelected(node.data as GoalMapData)}
        >
          <Background color="rgba(139, 92, 246, 0.14)" gap={24} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <Card className="map-detail-card">
        <Card.Header>
          <Card.Title>{selected ? selected.label : 'Explore your path'}</Card.Title>
          <Card.Description>
            {selected ? selected.description || `${selected.progress}% complete` : 'Select any node to inspect its role in the plan.'}
          </Card.Description>
        </Card.Header>
        {selected?.kind === 'task' && (
          <Card.Content className="map-detail-meta">
            {selected.difficulty && <DifficultyPill difficulty={selected.difficulty} />}
            <TimePill minutes={selected.durationMinutes ?? null} />
          </Card.Content>
        )}
      </Card>
    </div>
  )
}

function buildMap(goal: Goal): { nodes: GoalNode[]; edges: Edge[] } {
  const nodes: GoalNode[] = [
    {
      id: goal.id,
      type: 'kaizen',
      position: { x: 0, y: 180 },
      data: {
        label: goal.title,
        kind: 'goal',
        progress: goal.progress,
        status: goal.progress === 100 ? 'COMPLETED' : 'CURRENT',
        description: goal.description,
      },
    },
  ]
  const edges: Edge[] = []
  let yCursor = 0

  goal.milestones.forEach((milestone) => {
    const milestoneY = yCursor + Math.max(0, (milestone.tasks.length - 1) * 39)
    nodes.push({
      id: milestone.id,
      type: 'kaizen',
      position: { x: 330, y: milestoneY },
      data: {
        label: milestone.title,
        kind: 'milestone',
        progress: milestone.progress,
        status: milestone.status,
        description: milestone.description,
      },
    })
    edges.push({
      id: `${goal.id}-${milestone.id}`,
      source: goal.id,
      target: milestone.id,
      animated: milestone.status === 'CURRENT',
      style: { stroke: milestone.status === 'COMPLETED' ? '#5ee2a0' : '#7c5cff', strokeWidth: 1.5 },
    })
    milestone.tasks.forEach((task, taskIndex) => {
      const taskY = yCursor + taskIndex * 78
      nodes.push({
        id: task.id,
        type: 'kaizen',
        position: { x: 690, y: taskY },
        data: {
          label: task.title,
          kind: 'task',
          progress: task.completed ? 100 : 0,
          status: task.completed ? 'COMPLETED' : milestone.status === 'CURRENT' ? 'CURRENT' : 'UPCOMING',
          difficulty: task.difficulty,
          durationMinutes: task.durationMinutes,
          description: task.description,
        },
      })
      edges.push({
        id: `${milestone.id}-${task.id}`,
        source: milestone.id,
        target: task.id,
        style: { stroke: task.completed ? '#5ee2a0' : '#484258', strokeWidth: 1.25 },
      })
    })
    yCursor += Math.max(160, milestone.tasks.length * 78 + 30)
  })
  return { nodes, edges }
}
