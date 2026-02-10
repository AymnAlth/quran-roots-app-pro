import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, Area, ComposedChart
} from 'recharts';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';

// --- Types ---
interface TimelineItem {
    order: number;
    surahNo?: number;
    surah: string;
    count: number;
}

interface EraData {
    meccan: number;
    medinan: number;
}

interface Node {
    id: string;
    group: number;
    radius: number;
}

interface Link {
    source: string;
    target: string;
    value: number;
}

// --- NEW ISLAMIC PALETTE ---
const COLORS = {
    // Primary: Deep Teal (تركواز غامق)
    primary: '#0f4c5c',
    // Secondary: Golden (ذهبي)
    secondary: '#fb8b24',
    // Era Colors
    meccan: '#0f4c5c', // Teal for Meccan
    medinan: '#d4a373', // Muted Gold for Medinan
    // UI
    muted: 'var(--muted)',
    tooltipBg: 'var(--card)',
    tooltipBorder: 'var(--border)'
};

// --- Components ---

export const RevelationTimeline = ({ data, onClick }: { data: TimelineItem[]; onClick?: (surah: string) => void }) => {
    if (!data || data.length === 0) return <div className="text-muted-foreground font-quran text-center py-10">لا توجد بيانات</div>;

    return (
        <div className="w-full h-[300px] dir-ltr text-xs">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    onClick={(state) => {
                        if (state && state.activePayload && state.activePayload[0]) {
                            onClick && onClick(state.activePayload[0].payload.surah);
                        }
                    }}
                >
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS.primary} stopOpacity={1} />
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.6} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.muted} strokeOpacity={0.2} vertical={false} />
                    <XAxis
                        dataKey="order"
                        label={{ value: 'ترتيب النزول / المصحف', position: 'insideBottom', offset: -5, fill: 'var(--muted-foreground)' }}
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: COLORS.secondary, opacity: 0.1 }}
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            borderColor: 'var(--border)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontFamily: 'Amiri, serif'
                        }}
                        itemStyle={{ color: COLORS.primary, fontWeight: 'bold' }}
                        labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}
                        labelFormatter={(label) => `الترتيب: ${label}`}
                        formatter={(value: number, name: string, props: any) => [
                            <span className="font-bold text-lg">{value}</span>,
                            <span className="text-sm">سورة {props.payload.surah}</span>
                        ]}
                    />
                    <Bar
                        dataKey="count"
                        fill="url(#barGradient)"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const EraDistribution = ({ data, onClick }: { data: EraData; onClick?: (era: string) => void }) => {
    const chartData = [
        { name: 'مكية', value: data.meccan, type: 'meccan' },
        { name: 'مدنية', value: data.medinan, type: 'medinan' },
    ].filter(d => d.value > 0);

    const eraColors = [COLORS.meccan, COLORS.medinan];

    return (
        <div className="w-full h-[250px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        onClick={(data) => onClick && onClick(data.type)}
                        cursor="pointer"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={eraColors[index % eraColors.length]}
                                className="cursor-pointer hover:opacity-80 transition-opacity outline-none"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            borderColor: 'var(--border)',
                            borderRadius: '12px',
                            fontFamily: 'Amiri, serif'
                        }}
                        itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="font-quran text-sm mx-2">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="text-center text-sm text-muted-foreground mt-1 font-quran">
                <span className="font-bold" style={{ color: COLORS.meccan }}>{data.meccan}</span> مكية مقابل <span className="font-bold" style={{ color: COLORS.medinan }}>{data.medinan}</span> مدنية
            </div>
        </div>
    );
};

export const NetworkGraph = ({ nodes, links, onClick }: { nodes: Node[]; links: Link[]; onClick?: (root: string) => void }) => {
    // Radial Layout
    const centerX = 200;
    const centerY = 200;
    const radius = 120;

    if (!nodes || nodes.length === 0) return null;

    const centerNode = nodes[0];
    const rawSatellites = nodes.slice(1);
    const satelliteNodes = rawSatellites.filter(n => n.id.replace(/[\u064B-\u065F\u0670]/g, "").length >= 3);

    if (satelliteNodes.length === 0 && !centerNode) return null;
    const angleStep = (2 * Math.PI) / satelliteNodes.length;

    return (
        <div className="w-full h-[400px] flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background to-secondary/5 rounded-xl border border-primary/5">
            <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Links */}
                {satelliteNodes.map((node, i) => {
                    const angle = i * angleStep;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);

                    const link = links.find(l => l.target === node.id);
                    const strokeWidth = link ? Math.max(1, Math.min(3, link.value / 3)) : 1;
                    const count = link ? link.value : 0;

                    const midX = (centerX + x) / 2;
                    const midY = (centerY + y) / 2;

                    return (
                        <g key={`link-group-${i}`}>
                            <motion.line
                                x1={centerX}
                                y1={centerY}
                                x2={x}
                                y2={y}
                                stroke={COLORS.primary}
                                strokeOpacity="0.2"
                                strokeWidth={strokeWidth}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                            />

                            {/* Link Badge (Golden Dot) */}
                            <motion.circle
                                cx={midX}
                                cy={midY}
                                r="8"
                                fill="var(--card)"
                                stroke={COLORS.secondary}
                                strokeWidth="1"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1 }}
                            />
                            <motion.text
                                x={midX}
                                y={midY}
                                dy=".35em"
                                textAnchor="middle"
                                fontSize="9"
                                fill={COLORS.secondary}
                                fontWeight="bold"
                                className="font-mono"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.1 }}
                            >
                                {count}
                            </motion.text>
                        </g>
                    );
                })}

                {/* Satellite Nodes (Golden Theme) */}
                {satelliteNodes.map((node, i) => {
                    const angle = i * angleStep;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);

                    return (
                        <g key={`node-${i}`} onClick={() => onClick && onClick(node.id)} className="cursor-pointer group">
                            <motion.circle
                                cx={x}
                                cy={y}
                                r={Math.min(24, Math.max(18, node.radius))}
                                fill="var(--card)"
                                stroke={COLORS.secondary}
                                strokeWidth="1.5"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.05 }}
                                className="group-hover:fill-secondary/10 transition-colors shadow-sm"
                            />
                            <motion.text
                                x={x}
                                y={y}
                                dy=".35em"
                                textAnchor="middle"
                                fill="var(--foreground)"
                                fontSize="12"
                                fontWeight="bold"
                                className="pointer-events-none group-hover:scale-110 transition-transform font-quran"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 + i * 0.05 }}
                            >
                                {node.id}
                            </motion.text>
                        </g>
                    );
                })}

                {/* Center Node (Teal Theme) */}
                <g>
                    <motion.circle
                        cx={centerX}
                        cy={centerY}
                        r={Math.min(45, Math.max(35, centerNode.radius))}
                        fill={COLORS.primary}
                        stroke="var(--background)"
                        strokeWidth="4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="cursor-default drop-shadow-xl"
                    />
                    <text
                        x={centerX}
                        y={centerY}
                        dy=".35em"
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="18"
                        fontWeight="bold"
                        className="pointer-events-none font-quran"
                    >
                        {centerNode.id}
                    </text>
                </g>
            </svg>
            <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground bg-background/80 px-2 py-1 rounded-full border border-border">
                اضغط على الدوائر للمقارنة <Share2 className="w-3 h-3 inline ml-1" />
            </div>
        </div>
    );
};

export const WordFormsList = ({ forms, onClick }: { forms: { form: string, count: number }[]; onClick?: (form: string) => void }) => {
    if (!forms || forms.length === 0) return null;
    const max = forms[0].count;

    return (
        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1 custom-scrollbar">
            {forms.map((item, i) => (
                <motion.div
                    key={i}
                    onClick={() => onClick && onClick(item.form)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/60 hover:border-primary/40 hover:bg-secondary/5 transition-all cursor-pointer group"
                >
                    <span className="font-quran text-lg text-foreground group-hover:text-primary transition-colors">{item.form}</span>
                    <div className="flex items-center gap-2">
                        {/* Custom Progress Bar */}
                        <div className="h-1.5 w-14 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-l from-primary to-primary/60 rounded-full"
                                style={{ width: `${(item.count / max) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-primary w-6 text-left font-mono">{item.count}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export const RelationshipMatrix = ({ data, onClick }: { data: { x: string; y: string; value: number }[], onClick?: (x: string, y: string) => void }) => {
    // Cleaning Data
    const cleanData = data?.filter(d =>
        d.x.replace(/[\u064B-\u065F\u0670]/g, "").length >= 3 &&
        d.y.replace(/[\u064B-\u065F\u0670]/g, "").length >= 3
    ) || [];

    if (!cleanData || cleanData.length === 0) return <div className="text-center py-8 text-muted-foreground font-quran">لا توجد علاقات كافية للعرض</div>;

    const roots = Array.from(new Set(cleanData.map(d => d.x)));
    const maxVal = Math.max(...cleanData.filter(d => d.x !== d.y).map(d => d.value), 1);
    const gridSize = roots.length;

    return (
        <div className="w-full overflow-x-auto p-4 flex justify-center custom-scrollbar">
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `auto repeat(${gridSize}, minmax(42px, 1fr))` }}>
                {/* Header Row */}
                <div className="h-12"></div>
                {roots.map((root, i) => (
                    <div key={`head-${i}`} className="h-12 flex items-end justify-center pb-2">
                        <span className="text-xs font-bold text-primary -rotate-45 whitespace-nowrap origin-bottom-left translate-x-3 font-quran">{root}</span>
                    </div>
                ))}

                {/* Rows */}
                {roots.map((rowRoot, i) => (
                    <React.Fragment key={`row-${i}`}>
                        {/* Row Label */}
                        <div className="flex items-center justify-end pr-3">
                            <span className="text-xs font-bold text-primary font-quran">{rowRoot}</span>
                        </div>

                        {/* Cells */}
                        {roots.map((colRoot, j) => {
                            const cell = cleanData.find(d => d.x === rowRoot && d.y === colRoot) || { value: 0 };
                            const isSelf = rowRoot === colRoot;
                            const intensity = isSelf ? 0.1 : Math.min(1, cell.value / maxVal);

                            return (
                                <motion.div
                                    key={`cell-${i}-${j}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (i * 0.05) + (j * 0.05) }}
                                    onClick={() => !isSelf && onClick && onClick(rowRoot, colRoot)}
                                    className={`
                                        aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all
                                        ${isSelf ? 'bg-muted/30 text-muted-foreground/30 cursor-default' : 'cursor-pointer hover:ring-2 hover:ring-secondary hover:z-10 shadow-sm'}
                                    `}
                                    style={{
                                        // Teal Base Color with varying opacity
                                        backgroundColor: !isSelf ? `rgba(15, 76, 92, ${0.1 + (intensity * 0.8)})` : undefined,
                                        color: !isSelf && intensity > 0.6 ? '#fff' : 'inherit'
                                    }}
                                    title={!isSelf ? `${rowRoot} + ${colRoot}: ${cell.value} موضع` : ''}
                                >
                                    {cell.value > 0 ? cell.value : ''}
                                </motion.div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};