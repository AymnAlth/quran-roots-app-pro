import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import ForceGraph2D, { NodeObject, LinkObject, ForceGraphMethods } from 'react-force-graph-2d';
import { useQuran } from '../contexts/QuranContext';
import { PageContainer } from '../components/ui/PageContainer';
import { useLocation } from 'wouter';
import { Card } from '../components/ui/card';
import { Share2, ZoomIn, ZoomOut, Maximize, Search, Activity, Database, Sparkles, Pin, Unlock, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as d3 from 'd3-force';
// --- Types Fix: Use undefined instead of null for compatibility ---
interface NetworkNode extends NodeObject {
    id: string;
    val: number;
    group: number;
    color?: string;
    neighbors?: NetworkNode[];
    links?: NetworkLink[];
    fx?: number; // Removed | null (TypeScript Fix)
    fy?: number; // Removed | null (TypeScript Fix)
}

interface NetworkLink extends LinkObject {
    source: string | NetworkNode;
    target: string | NetworkNode;
    value: number;
}

const RootNetworkExplorer: React.FC = () => {
    const { statistics } = useQuran();
    const [_, setLocation] = useLocation();

    // Typing the ref correctly to access zoom methods
    const fgRef = useRef<ForceGraphMethods | undefined>(undefined);

    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

    // --- Lab State ---
    const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
    const [highlightLinks, setHighlightLinks] = useState(new Set<NetworkLink>());
    const [hoverNode, setHoverNode] = useState<NetworkNode | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Physics Controls
    const [isPhysicsPaused, setIsPhysicsPaused] = useState(false);
    const [pinnedNodesCount, setPinnedNodesCount] = useState(0);

    // --- Resize Handler ---
    useEffect(() => {
        const updateDim = () => {
            if (containerRef.current) {
                setDimensions({
                    w: containerRef.current.offsetWidth,
                    h: containerRef.current.offsetHeight
                });
            }
        };
        window.addEventListener('resize', updateDim);
        setTimeout(updateDim, 200);
        return () => window.removeEventListener('resize', updateDim);
    }, []);

    // --- Data Processing ---
    const graphData = useMemo(() => {
        if (!statistics || !statistics.network) return { nodes: [], links: [] };

        const nodes: NetworkNode[] = statistics.network.nodes.map(n => ({
            id: n.id,
            val: n.radius,
            group: n.group,
            color: n.group === 1 ? '#fb8b24' : '#0f4c5c',
            neighbors: [],
            links: [],
            // Important: Start undefined, not null
            fx: undefined,
            fy: undefined
        }));

        const links: NetworkLink[] = statistics.network.links.map(l => ({
            source: l.source,
            target: l.target,
            value: l.value
        }));

        // Neighbor linking
        links.forEach(link => {
            const a = nodes.find(n => n.id === link.source);
            const b = nodes.find(n => n.id === link.target);
            if (a && b) {
                a.neighbors?.push(b);
                b.neighbors?.push(a);
                a.links?.push(link);
                b.links?.push(link);
            }
        });

        return { nodes, links };
    }, [statistics]);

    // --- FIX: Force Configuration for Dispersion (فك التكدس) ---
    useEffect(() => {
        if (fgRef.current) {
            // 1. Charge: تنافر قوي جداً بين الجزيئات
            fgRef.current.d3Force('charge')?.strength(-400);

            // 2. Link: جعل الروابط مرنة وطويلة قليلاً
            fgRef.current.d3Force('link')?.distance(100);

            // 3. Center: جذب خفيف للمركز لكي لا تهرب الجزيئات بعيداً جداً
            // fgRef.current.d3Force('center')?.strength(0.05);

            // 4. Collision: منع التداخل (مهم جداً)
            // نفترض أن نصف قطر الدائرة حوالي 15-20
            // @ts-ignore (d3 method injection)
            fgRef.current.d3Force('collide', d3.forceCollide(25));

            // إعادة تسخين المحرك لتطبيق القوى
            fgRef.current.d3ReheatSimulation();
        }
    }, [graphData]); // Run when data loads

    // --- FIX: Zoom Handlers ---
    const handleZoomIn = () => {
        const currentZoom = fgRef.current?.zoom();
        if (typeof currentZoom === 'number') {
            fgRef.current?.zoom(currentZoom * 1.3, 400); // تكبير بنسبة 30%
        }
    };

    const handleZoomOut = () => {
        const currentZoom = fgRef.current?.zoom();
        if (typeof currentZoom === 'number') {
            fgRef.current?.zoom(currentZoom / 1.3, 400); // تصغير
        }
    };

    // --- LAB INTERACTIONS ---

    const handleNodeHover = (node: NetworkNode | null) => {
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());

        if (node) {
            const newHighlightNodes = new Set<string>();
            const newHighlightLinks = new Set<NetworkLink>();
            newHighlightNodes.add(node.id);
            node.neighbors?.forEach(neighbor => newHighlightNodes.add(neighbor.id));
            node.links?.forEach(link => newHighlightLinks.add(link));
            setHighlightNodes(newHighlightNodes);
            setHighlightLinks(newHighlightLinks);
        }
        setHoverNode(node || null);
    };

    const handleNodeDragEnd = (node: NetworkNode) => {
        // Fix position (Pin)
        node.fx = node.x;
        node.fy = node.y;
        setPinnedNodesCount(prev => prev + 1);

        if (!isPhysicsPaused) {
            fgRef.current?.d3ReheatSimulation();
        }
    };

    const handleNodeRightClick = (node: NetworkNode) => {
        // FIX: Use undefined instead of null
        node.fx = undefined;
        node.fy = undefined;
        setPinnedNodesCount(prev => Math.max(0, prev - 1));

        if (!isPhysicsPaused) {
            fgRef.current?.d3ReheatSimulation();
        }
    };

    const handleNodeClick = useCallback((node: NetworkNode) => {
        if (node.x && node.y) {
            fgRef.current?.centerAt(node.x, node.y, 1000);
            fgRef.current?.zoom(6, 2000);
            setTimeout(() => {
                // Uncomment to enable navigation
                // setLocation(`/details/${node.id}/root/search`); 
            }, 1200);
        }
    }, [setLocation]);

    const handleResetPhysics = () => {
        // FIX: Use undefined
        graphData.nodes.forEach(n => { n.fx = undefined; n.fy = undefined; });
        setPinnedNodesCount(0);
        fgRef.current?.d3ReheatSimulation();
    };

    const togglePhysicsPause = () => {
        if (isPhysicsPaused) {
            fgRef.current?.resumeAnimation();
        } else {
            fgRef.current?.pauseAnimation();
        }
        setIsPhysicsPaused(!isPhysicsPaused);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const node = graphData.nodes.find(n => n.id === searchTerm);
        if (node && node.x && node.y) {
            fgRef.current?.centerAt(node.x, node.y, 1000);
            fgRef.current?.zoom(6, 2000);
            setHoverNode(node);
            handleNodeHover(node);
        }
    };

    // --- Visuals ---
    const StarBackground = () => (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a1014] to-black">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            {[...Array(50)].map((_, i) => (
                <div key={i} className="absolute rounded-full bg-white animate-pulse"
                    style={{
                        top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                        width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
                        opacity: Math.random() * 0.5 + 0.1, animationDuration: `${Math.random() * 3 + 2}s`
                    }} />
            ))}
        </div>
    );

    return (
        <PageContainer
            isLoading={!statistics}
            loadingMessage="جاري تهيئة معمل البيانات..."
            className="p-0 h-[calc(100vh-64px)] overflow-hidden relative"
            contain={false}
        >
            <StarBackground />

            <div className="relative w-full h-full flex flex-col z-10" ref={containerRef}>

                {/* --- HUD: Top Left --- */}
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-4 pointer-events-none w-80">
                    <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="pointer-events-auto">
                        <Card className="p-5 bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl text-white">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-quran text-xl text-amber-400 flex items-center gap-2 drop-shadow-md">
                                    <Sparkles className="w-5 h-5" />
                                    معمل الجذور
                                </h3>
                                <div className="flex gap-1 items-center">
                                    <span className="text-[10px] text-gray-400 mr-2">
                                        {pinnedNodesCount > 0 ? `${pinnedNodesCount} مثبت` : ''}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full ${isPhysicsPaused ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                                </div>
                            </div>

                            <p className="text-xs text-gray-300 leading-relaxed font-light mb-4">
                                <b>اسحب</b> العقدة لتثبيتها في أي مكان. <b>انقر باليمين</b> لإلغاء التثبيت.
                            </p>

                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="ابحث وثبت..."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pr-9 text-sm h-9 focus-visible:ring-amber-500/50"
                                />
                            </form>
                        </Card>
                    </motion.div>

                    {/* Hover Info */}
                    <AnimatePresence>
                        {hoverNode && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="pointer-events-auto">
                                <Card className="p-4 bg-slate-900/80 backdrop-blur-xl border border-teal-500/30 text-white shadow-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-mono text-teal-400 uppercase">بيانات الجذر</span>
                                        {hoverNode.fx ? <Pin className="w-3 h-3 text-amber-500" /> : <Activity className="w-3 h-3 text-teal-400" />}
                                    </div>
                                    <h2 className="text-3xl font-bold font-quran text-amber-400 mb-1">{hoverNode.id}</h2>
                                    <div className="flex items-center gap-4 text-xs text-gray-300 mt-2">
                                        <div className="flex items-center gap-1"><Database className="w-3 h-3" /><span>{Math.round(hoverNode.val)}</span></div>
                                        <div className="flex items-center gap-1"><Share2 className="w-3 h-3" /><span>{hoverNode.neighbors?.length}</span></div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* --- HUD: Lab Controls (Top Right) --- */}
                <div className="absolute top-6 right-6 z-20 pointer-events-auto">
                    <TooltipProvider delayDuration={0}>
                        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-1 flex flex-col gap-1 shadow-2xl">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 w-8 h-8" onClick={togglePhysicsPause}>
                                        {isPhysicsPaused ? <Play className="w-4 h-4 text-green-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left"><p>{isPhysicsPaused ? 'استئناف الفيزياء' : 'إيقاف الفيزياء مؤقتاً'}</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 w-8 h-8" onClick={handleResetPhysics}>
                                        <Unlock className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left"><p>إلغاء تثبيت الكل</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 w-8 h-8" onClick={() => fgRef.current?.d3ReheatSimulation()}>
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left"><p>تنشيط الشبكة</p></TooltipContent>
                            </Tooltip>
                        </Card>
                    </TooltipProvider>
                </div>

                {/* --- HUD: Navigation (Bottom Right) --- */}
                <div className="absolute bottom-6 right-6 z-20 flex gap-2 pointer-events-auto">
                    <Button size="icon" variant="secondary" className="bg-white/10 backdrop-blur border border-white/10 text-white hover:bg-white/20" onClick={handleZoomIn}>
                        <ZoomIn className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-white/10 backdrop-blur border border-white/10 text-white hover:bg-white/20" onClick={handleZoomOut}>
                        <ZoomOut className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-amber-500/80 backdrop-blur border border-amber-500/50 text-white hover:bg-amber-600" onClick={() => fgRef.current?.zoomToFit()}>
                        <Maximize className="w-5 h-5" />
                    </Button>
                </div>

                {/* --- The Graph --- */}
                {graphData.nodes.length > 0 && (
                    <ForceGraph2D
                        // @ts-ignore
                        ref={fgRef}
                        width={dimensions.w}
                        height={dimensions.h}
                        graphData={graphData}
                        nodeLabel="id"
                        backgroundColor="transparent"

                        // Physics Configuration (Strong Repulsion for Scatter)
                        d3AlphaDecay={0.02}
                        d3VelocityDecay={0.3}
                        cooldownTicks={100}

                        // Handlers
                        onNodeHover={handleNodeHover as any}
                        onNodeClick={handleNodeClick}
                        onNodeDragEnd={handleNodeDragEnd}
                        onNodeRightClick={handleNodeRightClick}
                        onEngineStop={() => !isPhysicsPaused && fgRef.current?.zoomToFit(600, 100)}

                        // Visuals
                        linkColor={(link: any) => highlightLinks.has(link) ? '#fb8b24' : '#0f4c5c'}
                        linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 0.5}
                        linkCanvasObject={(link: any, ctx) => {
                            if (highlightLinks.has(link)) {
                                ctx.beginPath();
                                ctx.moveTo(link.source.x, link.source.y);
                                ctx.lineTo(link.target.x, link.target.y);
                                ctx.strokeStyle = 'rgba(251, 139, 36, 0.8)';
                                ctx.lineWidth = 2;
                                ctx.shadowBlur = 10;
                                ctx.shadowColor = '#fb8b24';
                                ctx.stroke();
                                ctx.shadowBlur = 0;
                            }
                        }}

                        nodeCanvasObject={(node, ctx, globalScale) => {
                            const n = node as NetworkNode;
                            if (!Number.isFinite(n.x) || !Number.isFinite(n.y)) return;

                            const label = n.id;
                            const fontSize = 14 / globalScale;
                            const r = Math.sqrt(Math.max(0, n.val || 1)) * 4;
                            const isHovered = n === hoverNode;
                            const isNeighbor = highlightNodes.has(n.id);
                            const isDimmed = hoverNode && !isHovered && !isNeighbor;
                            // Check if pinned (fx is defined)
                            const isPinned = n.fx !== undefined;

                            const opacity = isDimmed ? 0.1 : 1;

                            try {
                                ctx.globalAlpha = opacity;

                                // 1. Glow
                                const glowRadius = isHovered ? r * 4 : r * 2.5;
                                const glow = ctx.createRadialGradient(n.x!, n.y!, r * 0.2, n.x!, n.y!, glowRadius);

                                if (n.group === 1) {
                                    glow.addColorStop(0, 'rgba(251, 139, 36, 1)');
                                    glow.addColorStop(1, 'rgba(251, 139, 36, 0)');
                                } else if (isNeighbor || isHovered) {
                                    glow.addColorStop(0, 'rgba(20, 184, 166, 0.8)');
                                    glow.addColorStop(1, 'rgba(20, 184, 166, 0)');
                                } else {
                                    glow.addColorStop(0, 'rgba(15, 76, 92, 0.5)');
                                    glow.addColorStop(1, 'rgba(15, 76, 92, 0)');
                                }

                                ctx.fillStyle = glow;
                                ctx.beginPath();
                                ctx.arc(n.x!, n.y!, glowRadius, 0, 2 * Math.PI, false);
                                ctx.fill();

                                // 2. Core
                                ctx.beginPath();
                                ctx.arc(n.x!, n.y!, r, 0, 2 * Math.PI, false);
                                ctx.fillStyle = n.group === 1 ? '#fff' : (isHovered || isNeighbor ? '#ccfbf1' : '#e2e8f0');
                                ctx.fill();

                                // 3. Pin Indicator (Red Ring)
                                if (isPinned) {
                                    ctx.beginPath();
                                    ctx.arc(n.x!, n.y!, r + 4, 0, 2 * Math.PI, false);
                                    ctx.strokeStyle = '#ef4444';
                                    ctx.lineWidth = 1.5 / globalScale;
                                    ctx.setLineDash([2, 2]); // Dashed line
                                    ctx.stroke();
                                    ctx.setLineDash([]); // Reset
                                }

                                // 4. Label
                                if (isHovered || isNeighbor || r > 10 || globalScale > 2) {
                                    ctx.font = `${isHovered ? 'bold' : ''} ${fontSize}px Amiri`;
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';
                                    ctx.shadowColor = 'black';
                                    ctx.shadowBlur = 4;
                                    ctx.lineWidth = 3;
                                    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                                    ctx.strokeText(label, n.x!, n.y! + r + fontSize);
                                    ctx.shadowBlur = 0;
                                    ctx.fillStyle = isPinned ? '#fca5a5' : (isHovered ? '#fb8b24' : '#ffffff');
                                    ctx.fillText(label, n.x!, n.y! + r + fontSize);
                                }

                                ctx.globalAlpha = 1;
                            } catch (e) { }
                        }}
                    />
                )}
            </div>
        </PageContainer>
    );
};

export default RootNetworkExplorer;