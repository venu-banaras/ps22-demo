import { useState, useEffect } from "react";
import InstallTab from "./component/InstallTab";
import { ALL_THREATS, C, CAMS, lbl, MODES } from "./utils/constant";




/* ── THREAT MAP ── */
function ThreatMap({ threats, selected, onSelect, tick, mode }) {
    const CX = 150, CY = 150, MAXR = 128, MINR = 16;
    const toR = r => MINR + (MAXR - MINR) * (r / 300);
    const activeSectors = MODES[mode].active;
    const disArcs = [];
    if (!activeSectors.includes("FRONT")) disArcs.push({ s: -70, e: 70 });
    if (!activeSectors.includes("REAR")) disArcs.push({ s: 110, e: 250 });
    if (!activeSectors.includes("FLANK")) { disArcs.push({ s: 60, e: 120 }); disArcs.push({ s: 240, e: 300 }); }
    const arcPath = (sd, ed, r = MAXR + 12) => {
        const s = ((sd - 90) * Math.PI) / 180, e = ((ed - 90) * Math.PI) / 180;
        const x1 = CX + r * Math.cos(s), y1 = CY + r * Math.sin(s), x2 = CX + r * Math.cos(e), y2 = CY + r * Math.sin(e);
        return `M${CX},${CY} L${x1},${y1} A${r},${r} 0 ${(ed - sd) > 180 ? 1 : 0} 1 ${x2},${y2} Z`;
    };
    const spokeL = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return (
        <svg width={300} height={300}>
            <circle cx={CX} cy={CY} r={145} fill="#020810" />
            {disArcs.map((a, i) => (
                <g key={i}>
                    <path d={arcPath(a.s, a.e)} fill="#ff000015" />
                    <text x={CX + 80 * Math.cos(((((a.s + a.e) / 2) - 90) * Math.PI) / 180)}
                        y={CY + 80 * Math.sin(((((a.s + a.e) / 2) - 90) * Math.PI) / 180) + 3}
                        textAnchor="middle" fill="#ff000055" fontSize={10} fontFamily={C.mono}>STBY</text>
                </g>
            ))}
            {[{ r: 50, c: C.red + "55" }, { r: 150, c: C.amber + "44" }, { r: 300, c: C.blue + "33" }].map(({ r, c }, i) => (
                <g key={r}>
                    <circle cx={CX} cy={CY} r={toR(r)} fill="none" stroke={c} strokeWidth={i === 0 ? 1.5 : 1} />
                    <text x={CX + toR(r) + 3} y={CY - 2} fill={c} fontSize={6.5} fontFamily={C.mono}>{r}m</text>
                </g>
            ))}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                const rad = ((deg - 90) * Math.PI) / 180;
                return (<g key={deg}>
                    <line x1={CX} y1={CY} x2={CX + 143 * Math.cos(rad)} y2={CY + 143 * Math.sin(rad)} stroke={C.border} strokeWidth={0.5} />
                    <text x={CX + 151 * Math.cos(rad)} y={CY + 151 * Math.sin(rad) + 3} textAnchor="middle" fill={C.dimmer} fontSize={6.5} fontFamily={C.mono}>{spokeL[i]}</text>
                </g>);
            })}
            <line x1={CX} y1={CY}
                x2={CX + 140 * Math.cos(((tick * 2.5 - 90) * Math.PI) / 180)}
                y2={CY + 140 * Math.sin(((tick * 2.5 - 90) * Math.PI) / 180)}
                stroke="#00ff4410" strokeWidth={3} />
            <rect x={CX - 9} y={CY - 17} width={18} height={34} rx={3} fill="#0d2035" stroke="#1e5080" strokeWidth={1.5} />
            <rect x={CX - 6} y={CY - 13} width={12} height={18} rx={2} fill="#081828" stroke="#153a5a" strokeWidth={1} />
            <polygon points={`${CX},${CY - 22} ${CX - 5},${CY - 15} ${CX + 5},${CY - 15}`} fill="#1e5080" />
            {threats.map(t => {
                const rad = ((t.bearing - 90) * Math.PI) / 180, r = toR(t.range);
                const tx = CX + r * Math.cos(rad), ty = CY + r * Math.sin(rad), isSel = selected?.id === t.id;
                return (<g key={t.id} onClick={() => onSelect(isSel ? null : t)} style={{ cursor: "pointer" }}>
                    {t.moving && <circle cx={tx} cy={ty} r={9} fill="none" stroke={t.color} strokeWidth={1.2} opacity={0.5}>
                        <animate attributeName="r" from="7" to="18" dur="1.3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.6" to="0" dur="1.3s" repeatCount="indefinite" />
                    </circle>}
                    {t.cls === "VEHICLE"
                        ? <rect x={tx - 6} y={ty - 4} width={12} height={8} rx={1} fill={isSel ? t.color : t.color + "cc"} stroke={C.white} strokeWidth={isSel ? 2 : 1} />
                        : <circle cx={tx} cy={ty} r={isSel ? 8 : 6} fill={isSel ? t.color : t.color + "cc"} stroke={C.white} strokeWidth={isSel ? 2 : 1} />}
                    <text x={tx} y={ty - 12} textAnchor="middle" fill={t.color} fontSize={10} fontFamily={C.mono} fontWeight="bold">{t.range}m</text>
                </g>);
            })}
            <circle cx={CX} cy={CY} r={145} fill="none" stroke={C.border} strokeWidth={1} />
        </svg>
    );
}

/* ── CAMERA FEED ── */
function CameraFeed({ threat, nightMode }) {
    if (!threat) return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={lbl("No threat selected — click map or alert card", C.dimmer, 12), { fontSize: '12px', color: '#ffffffbe' }}>No threat selected — click map icon or alert card</span>
        </div>
    );
    const thermal = threat.cam.includes("MID") && threat.cam.includes("REAR") || nightMode;
    const sc = thermal ? C.green : threat.color;
    return (
        <svg width="100%" height="100%" viewBox="0 0 340 140" preserveAspectRatio="xMidYMid slice">
            {thermal
                ? <rect x={0} y={0} width={340} height={140} fill="#000900" />
                : <>
                    <rect x={0} y={0} width={340} height={70} fill="#040d18" />
                    <rect x={0} y={70} width={340} height={70} fill="#030c0a" />
                </>
            }
            <rect x={15} y={32} width={55} height={38} fill={thermal ? "#001800" : "#0d1a0a"} opacity={0.7} />
            <rect x={250} y={24} width={70} height={46} fill={thermal ? "#001500" : "#0a150a"} opacity={0.7} />

            {threat.cls === "HUMAN" && <g>
                {/* Body: Scaled down (ry=12) and moved lower to cy=84 */}
                <ellipse cx={165} cy={84} rx={7} ry={12} fill={thermal ? "#00ee44" : "#999"} opacity={0.9} />
                {/* Head: Moved down to cy={71} to sit clearly below the header */}
                <circle cx={165} cy={71} r={7} fill={thermal ? "#00ff66" : "#aaa"} />

                {/* Bounding Box Frame */}
                <rect x={145} y={48} width={40} height={50} rx={2} fill="none" stroke={threat.color} strokeWidth={2} />
                {/* Top Header Label */}
                <rect x={145} y={48} width={40} height={14} fill={threat.color} fillOpacity={0.9} />
                <text x={165} y={59} textAnchor="middle" fill={C.white} fontSize={7.5} fontFamily={C.mono} fontWeight="bold">HUMAN</text>

                {/* Bottom Range Label: Positioned at y=104 to avoid overlap with box bottom */}
                <rect x={147} y={104} width={36} height={13} rx={2} fill={threat.color} />
                <text x={165} y={114} textAnchor="middle" fill={C.white} fontSize={11} fontFamily={C.mono} fontWeight="bold">{threat.range}m</text>
            </g>}

            {threat.cls === "VEHICLE" && <g>
                <rect x={115} y={68} width={110} height={55} rx={3} fill={thermal ? "#003300" : "#1a2a1a"} stroke={thermal ? "#00aa00" : "#2a3a2a"} strokeWidth={1} />
                <rect x={130} y={56} width={80} height={22} rx={2} fill={thermal ? "#002800" : "#151f15"} />
                <rect x={118} y={56} width={104} height={68} rx={2} fill="none" stroke={threat.color} strokeWidth={2} />
                <rect x={118} y={56} width={104} height={15} fill={threat.color} fillOpacity={0.9} />
                <text x={170} y={68} textAnchor="middle" fill={C.white} fontSize={7.5} fontFamily={C.mono} fontWeight="bold">VEHICLE</text>
                <rect x={143} y={126} width={54} height={13} rx={2} fill={threat.color} />
                <text x={170} y={136} textAnchor="middle" fill={C.white} fontSize={11} fontFamily={C.mono} fontWeight="bold">{threat.range}m</text>
            </g>}

            <rect x={0} y={0} width={340} height={18} fill="#00000099" />
            <text x={5} y={12} fill={sc} fontSize={7.5} fontFamily={C.mono}>{`CAM:${threat.cam} | ${thermal ? "THML" : "RGB"} | BRG:${threat.bearing}° | CONF:${threat.conf}% | TRK#${threat.id}`}</text>

            {[[6, 22], [334, 22], [6, 128], [334, 128]].map(([x, y], i) => (
                <g key={i}>
                    <line x1={x} y1={y} x2={x + (i % 2 === 0 ? 12 : -12)} y2={y} stroke={sc} strokeWidth={1.5} opacity={0.6} />
                    <line x1={x} y1={y} x2={x} y2={y + (i < 2 ? 12 : -12)} stroke={sc} strokeWidth={1.5} opacity={0.6} />
                </g>
            ))}
        </svg>

    );
}

/* ── NEAR-FIELD IPM ── */
function NearField({ nightMode, mode }) {
    const col = nightMode ? C.green : C.blue, ground = nightMode ? "#000900" : "#040c14";
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid slice">
            <rect x={0} y={0} width={200} height={125} fill={ground} />
            {[...Array(7)].map((_, i) => <line key={`h${i}`} x1={0} y1={14 + i * 17} x2={200} y2={14 + i * 17} stroke={nightMode ? "#001800" : "#0a1624"} strokeWidth={0.5} />)}
            {[...Array(10)].map((_, i) => <line key={`v${i}`} x1={i * 22} y1={0} x2={i * 22} y2={125} stroke={nightMode ? "#001800" : "#0a1624"} strokeWidth={0.5} />)}
            <rect x={82} y={28} width={36} height={78} rx={4} fill={nightMode ? "#001400" : "#061420"} stroke={col} strokeWidth={1.5} />
            <rect x={87} y={34} width={26} height={40} rx={2} fill={ground} stroke={col + "88"} strokeWidth={0.8} />
            <rect x={76} y={30} width={7} height={74} rx={1} fill={col + "44"} stroke={col} strokeWidth={0.8} />
            <rect x={117} y={30} width={7} height={74} rx={1} fill={col + "44"} stroke={col} strokeWidth={0.8} />
            <polygon points="100,20 94,31 106,31" fill={col} opacity={0.8} />
            <ellipse cx={100} cy={67} rx={36} ry={52} fill="none" stroke={col} strokeWidth={0.6} strokeDasharray="3 3" opacity={0.4} />
            <text x={137} y={70} fill={col} fontSize={5.5} fontFamily={C.mono} opacity={0.6}>5m</text>
            {mode === "STATIC" && <text x={100} y={10} textAnchor="middle" fill={C.blue} fontSize={11} fontFamily={C.mono}>5fps MODE</text>}
            {(mode === "LEAD" || mode === "TAIL") && <text x={100} y={10} textAnchor="middle" fill={C.amber} fontSize={11} fontFamily={C.mono}>{mode === "LEAD" ? "REAR STBY" : "FRONT STBY"}</text>}
            <text x={100} y={120} textAnchor="middle" fill={col} fontSize={5.5} fontFamily={C.mono} opacity={0.5}>IPM STITCH 0–15m</text>
        </svg>
    );
}

/* ── PANORAMIC STRIP ── */
// function PanoStrip({ threats, mode, nightMode, tick }) {
//     const W = 800, H = 88, activeSectors = MODES[mode].active;
//     const bx = b => (b / 360) * W;
//     return (
//         <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
//             <rect x={0} y={0} width={W} height={H} fill={nightMode ? "#000900" : "#030c14"} />
//             {CAMS.map(cam => {
//                 const x = bx(cam.angle), hw = W / 16, active = activeSectors.includes(cam.sector);
//                 const col = cam.type === "THERMAL" ? C.purple : C.blue;
//                 return (<g key={cam.id}>
//                     <rect x={x - hw} y={0} width={hw * 2} height={H}
//                         fill={active ? col + "0a" : "#ff00000a"} stroke={active ? col + "33" : "#ff000033"} strokeWidth={0.5} />
//                     {active && <><rect x={x - hw} y={0} width={hw * 2} height={H * (nightMode ? 1 : 0.55)}
//                         fill={nightMode ? "#000900" : "#040c18"} /><rect x={x - hw} y={H * (nightMode ? 1 : 0.55)} width={hw * 2} height={H * (nightMode ? 0 : 0.45)} fill={nightMode ? "#000900" : "#030a0c"} /></>}
//                     {!active && <text x={x} y={H / 2 + 3} textAnchor="middle" fill="#ff000055" fontSize={10} fontFamily={C.mono}>STBY</text>}
//                     <text x={x} y={H - 5} textAnchor="middle" fill={active ? col : "#ff000044"} fontSize={11} fontFamily={C.mono}>{cam.id}</text>
//                     <line x1={x + hw} y1={0} x2={x + hw} y2={H} stroke={C.border} strokeWidth={0.5} />
//                 </g>);
//             })}
//             {threats.map(t => {
//                 if (!activeSectors.includes(t.sector)) return null;
//                 const tx = bx(t.bearing), ty = H * 0.1 + (H * 0.65) * (1 - t.range / 300);
//                 return (<g key={`s${t.id}`}>
//                     <line x1={tx} y1={ty + 10} x2={tx} y2={H * 0.55} stroke={t.color} strokeWidth={0.8} strokeDasharray="2 2" opacity={0.5} />
//                     {t.cls === "VEHICLE"
//                         ? <rect x={tx - 8} y={ty - 5} width={16} height={10} rx={1} fill={t.color} fillOpacity={0.85} stroke={C.white} strokeWidth={0.8} />
//                         : <ellipse cx={tx} cy={ty} rx={5} ry={7} fill={t.color} fillOpacity={0.85} stroke={C.white} strokeWidth={0.8} />}
//                     <text x={tx} y={ty - 10} textAnchor="middle" fill={t.color} fontSize={11} fontFamily={C.mono} fontWeight="bold">{t.range}m</text>
//                 </g>);
//             })}
//             {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
//                 <g key={deg}>
//                     <line x1={bx(deg)} y1={0} x2={bx(deg)} y2={6} stroke={C.dim} strokeWidth={0.8} />
//                     <text x={bx(deg)} y={13} textAnchor="middle" fill={C.dim} fontSize={11} fontFamily={C.mono}>{deg}°</text>
//                 </g>
//             ))}
//             <line x1={bx(tick * 3 % 360)} y1={0} x2={bx(tick * 3 % 360)} y2={H} stroke="#00ff4412" strokeWidth={2} />
//             <rect x={0} y={0} width={W} height={H} fill="none" stroke={C.border} strokeWidth={1} />
//             <text x={3} y={22} fill={C.dim} fontSize={5.5} fontFamily={C.mono}>0°(N)</text>
//             <text x={W - 3} y={22} textAnchor="end" fill={C.dim} fontSize={5.5} fontFamily={C.mono}>360°(N)</text>
//         </svg>
//     );
// }
function PanoStrip({ threats, mode, nightMode, tick }) {
    // Increase H to 200. This makes elements smaller relative to the overall area.
    const W = 800, H = 200, activeSectors = MODES[mode].active;
    const bx = b => (b / 360) * W;

    return (
        /* Use 'meet' to ensure it fits perfectly within your UI panel without cropping */
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            <rect x={0} y={0} width={W} height={H} fill={nightMode ? "#000900" : "#030c14"} />

            {CAMS.map(cam => {
                const x = bx(cam.angle), hw = W / 16, active = activeSectors.includes(cam.sector);
                const col = cam.type === "THERMAL" ? C.purple : C.blue;
                return (<g key={cam.id}>
                    <rect x={x - hw} y={0} width={hw * 2} height={H}
                        fill={active ? col + "0a" : "#ff00000a"} stroke={active ? col + "33" : "#ff000033"} strokeWidth={0.5} />
                    {active && <>
                        {/* Horizon line centered at 50% for more balance */}
                        <rect x={x - hw} y={0} width={hw * 2} height={H * 0.5} fill={nightMode ? "#000900" : "#040c18"} />
                        <rect x={x - hw} y={H * 0.5} width={hw * 2} height={H * 0.5} fill={nightMode ? "#000900" : "#030a0c"} />
                    </>}
                    {!active && <text x={x} y={H / 2 + 5} textAnchor="middle" fill="#ff000055" fontSize={12} fontFamily={C.mono}>STBY</text>}
                    <text x={x} y={H - 15} textAnchor="middle" fill={active ? col : "#ff000044"} fontSize={14} fontFamily={C.mono}>{cam.id}</text>
                    <line x1={x + hw} y1={0} x2={x + hw} y2={H} stroke={C.border} strokeWidth={0.5} />
                </g>);
            })}

            {threats.map(t => {
                if (!activeSectors.includes(t.sector)) return null;
                const tx = bx(t.bearing);
                // Position icons in the middle 40% of the strip
                const ty = (H * 0.3) + (H * 0.4) * (1 - t.range / 300);

                return (<g key={`s${t.id}`}>
                    <line x1={tx} y1={ty} x2={tx} y2={H * 0.5} stroke={t.color} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
                    {t.cls === "VEHICLE"
                        ? <rect x={tx - 12} y={ty - 8} width={24} height={16} rx={2} fill={t.color} fillOpacity={0.85} stroke={C.white} strokeWidth={1} />
                        : <circle cx={tx} cy={ty} r={10} fill={t.color} fillOpacity={0.85} stroke={C.white} strokeWidth={1} />}
                    <text x={tx} y={ty - 18} textAnchor="middle" fill={t.color} fontSize={14} fontFamily={C.mono} fontWeight="bold">{t.range}m</text>
                </g>);
            })}

            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                <g key={deg}>
                    <line x1={bx(deg)} y1={0} x2={bx(deg)} y2={10} stroke={C.dim} strokeWidth={1} />
                    <text x={bx(deg)} y={25} textAnchor="middle" fill={C.dim} fontSize={14} fontFamily={C.mono}>{deg}°</text>
                </g>
            ))}
        </svg>
    );
}




/* ── DISPLAY TAB ── */
function DisplayTab() {
    const [selected, setSelected] = useState(ALL_THREATS[0]);
    const [tick, setTick] = useState(0);
    const [mode, setMode] = useState("FULL");
    const [nightMode, setNightMode] = useState(false);
    const [ackdIds, setAckdIds] = useState(new Set());
    const [allClear, setAllClear] = useState(false);
    const [ackTimer, setAckTimer] = useState(null);
    const [acTimer, setAcTimer] = useState(null);
    const [blink, setBlink] = useState(true);

    useEffect(() => { const t = setInterval(() => setTick(p => p + 1), 50); return () => clearInterval(t); }, []);
    useEffect(() => { const t = setInterval(() => setBlink(p => !p), 500); return () => clearInterval(t); }, []);
    useEffect(() => {
        if (ackTimer === null) return;
        if (ackTimer <= 0) { setAckdIds(new Set()); setAckTimer(null); return; }
        const t = setTimeout(() => setAckTimer(p => p - 1), 1000); return () => clearTimeout(t);
    }, [ackTimer]);
    useEffect(() => {
        if (acTimer === null) return;
        if (acTimer <= 0) { setAllClear(false); setAcTimer(null); return; }
        const t = setTimeout(() => setAcTimer(p => p - 1), 1000); return () => clearTimeout(t);
    }, [acTimer]);

    const activeSectors = MODES[mode].active;
    const visible = ALL_THREATS.filter(t => activeSectors.includes(t.sector));
    const active = allClear ? [] : visible.filter(t => !ackdIds.has(t.id));
    const pri = ["#e8203a", "#f5a623", "#4a90d9", "#e8d400"];
    const highest = active.sort((a, b) => pri.indexOf(a.color) - pri.indexOf(b.color))[0] || null;
    const display = selected && active.find(t => t.id === selected.id) ? selected : highest;
    const modeInfo = MODES[mode];

    const handleAck = () => {
        if (!highest) return;
        setAckdIds(prev => new Set([...prev, highest.id]));
        setAckTimer(30);
        if (display?.id === highest.id) setSelected(null);
    };
    const handleAC = () => { setAllClear(true); setAcTimer(60); setSelected(null); };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: '0 10px' }}>
            <div style={{ border: '.5px dotted #26549d', borderRadius: '3px', padding: "5px" }}>


                {/* Top bar */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px", background: "#11223d", borderRadius: 4, marginBottom: "10px"
                }}>
                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                        <span style={{ ...lbl("ACTIVE", C.green, 11), color: '#56ff56', background: "#196019", padding: "2px 6px", borderRadius: 2 }}>● ACTIVE</span>
                        <span style={lbl("~28ms", C.green, 11)}>LATENCY: ~28ms</span>
                        <span style={lbl(`${visible.length} TRACKING | ${active.length} ALERTED`, active.length > 0 ? C.amber : C.dim, 11)}>
                            {visible.length} TRACKING | {active.length} ALERTED
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span onClick={() => setNightMode(false)} style={{ cursor: "pointer", fontSize: 20, opacity: nightMode ? 0.3 : 1 }} title="Day">☀</span>
                        <span onClick={() => setNightMode(true)} style={{ cursor: "pointer", fontSize: 20, opacity: nightMode ? 1 : 0.3 }} title="Night/Thermal">🌙</span>
                    </div>
                </div>

                {/* Mode bar */}
                <div style={{
                    display: "flex", gap: 5, alignItems: "center", padding: "5px 10px",
                    background: "#08172e", border: `1px solid #0a2853`, borderRadius: 4
                }}>
                    <div style={{ display: "flex", gap: 5, alignItems: "center", width: '316px' }}>


                        <span style={{ ...lbl("MODE:", C.dim, 11), minWidth: 50 }}>MODE:</span>
                        {Object.entries(MODES).map(([key, m]) => (
                            <button key={key} onClick={() => setMode(key)} style={{
                                padding: "4px 10px", cursor: "pointer", fontSize: 12, letterSpacing: "0.08em",
                                background: mode === key ? m.color + "22" : "transparent",
                                border: `1px solid ${mode === key ? m.color : "#254168"}`, borderRadius: 3,
                                color: mode === key ? C.white : C.dim, transition: "all 0.15s"
                            }}>
                                <div style={{ fontWeight: "500" }}>{key}</div>
                                <div style={{ fontSize: 10, color: mode === key ? m.color : C.dim, opacity: 0.8 }}>{m.power}</div>
                            </button>
                        ))}
                    </div>
                    <div style={{
                        flex: 1, padding: "7px", background: modeInfo.color + "11",
                        border: `1px solid ${modeInfo.color}33`, borderRadius: 3, height: '100%'
                    }}>
                        <span style={lbl(modeInfo.desc, C.white + "bb", 11), { fontSize: '12px', color: '#dee5e9b5' }}>{modeInfo.desc}</span>
                    </div>
                </div>

                {/* Main panels */}
                <div style={{ display: "flex", gap: 8 }}>

                    {/* Left: threat map + alerts + buttons */}
                    <div style={{ width: 325, flexShrink: 0, padding: 10, marginTop: 10, background: '#11223d' }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>


                            <span style={lbl("PANEL 1 — BEARING/RANGE THREAT MAP", C.blue, 10)}>PANEL 1 — BEARING/RANGE THREAT MAP</span>
                            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 3, display: "flex", justifyContent: "center" }}>
                                <ThreatMap threats={visible} selected={display} onSelect={setSelected} tick={tick} mode={mode} />
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {[[C.red, "HUMAN <50m"], [C.amber, "HUMAN 50-150m"], [C.yellow, "HUMAN 150-300m"], [C.blue, "VEHICLE"]].map(([c, t]) => (
                                    <div key={t} style={{ display: "flex", gap: 3, alignItems: "center" }}>
                                        <span style={{ width: 6, height: 6, background: c, borderRadius: "50%", display: "inline-block" }} />
                                        <span style={lbl(t, C.dim, 10)}>{t}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Alert cards */}
                            {ALL_THREATS.map(t => {
                                const isVis = !!visible.find(x => x.id === t.id);
                                const isAct = !!active.find(x => x.id === t.id);
                                const isAckd = ackdIds.has(t.id);
                                const isSel = display?.id === t.id;
                                const blinkThis = isAct && t.color === C.red && !blink;
                                return (
                                    <div key={t.id} onClick={() => isAct && setSelected(isSel ? null : t)}
                                        style={{
                                            padding: "5px 8px",
                                            background: isSel ? t.color + "22" : C.panel,
                                            border: `1px solid ${isSel ? t.color : isAct ? t.color + "55" : C.border}`,
                                            borderRadius: 3, cursor: isAct ? "pointer" : "default",
                                            opacity: isVis ? (blinkThis ? 0.5 : 1) : 0.28, transition: "opacity 0.3s"
                                        }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={lbl(t.cls, t.color, 11, true)}>{t.cls}</span>
                                            <span style={lbl(isAckd ? `ACK ${ackTimer}s` : allClear ? `AC ${acTimer}s` : !isVis ? "SECTOR OFF" : t.zone,
                                                isAckd ? C.amber : allClear ? C.green : !isVis ? C.dim : t.color, 10)}>
                                                {isAckd ? `ACK ${ackTimer}s` : allClear ? `AC ${acTimer}s` : !isVis ? "SECTOR OFF" : t.zone}
                                            </span>
                                        </div>
                                        <div style={lbl(`${t.bearing}° — ${t.range}m`, C.white, 12)}>{t.bearing}° — {t.range}m</div>
                                        <div style={lbl(`${t.moving ? "▶ MOVING" : "○ STATIC"}${isAct && t.color === C.red ? " | CONTINUOUS TONE" : isAct && t.color === C.amber ? " | 2Hz PULSE" : ""}`,
                                            t.moving && isAct ? t.color : C.dim, 10)}>
                                            {t.moving ? "▶ MOVING" : "○ STATIC"}{isAct && t.color === C.red ? " | CONTINUOUS TONE" : isAct && t.color === C.amber ? " | 2Hz PULSE" : ""}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Buttons */}
                            <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={handleAck} disabled={!highest || !!ackTimer}
                                    style={{
                                        flex: 1, padding: "7px 4px", fontFamily: C.mono, fontSize: 12, letterSpacing: "0.08em",
                                        cursor: highest && !ackTimer ? "pointer" : "not-allowed", lineHeight: 1.5,
                                        background: C.amber + "22", border: `1px solid ${ackTimer ? C.dim : C.amber}`,
                                        borderRadius: 3, color: ackTimer ? C.dim : C.amber
                                    }}>
                                    ACK<br /><span style={{ fontSize: 10 }}>{ackTimer ? `${ackTimer}s left` : "30s SUPPRESS"}</span>
                                </button>
                                <button onClick={handleAC} disabled={!!acTimer}
                                    style={{
                                        flex: 1, padding: "7px 4px", fontFamily: C.mono, fontSize: 12, letterSpacing: "0.08em",
                                        cursor: !acTimer ? "pointer" : "not-allowed", lineHeight: 1.5,
                                        background: C.green + "22", border: `1px solid ${acTimer ? C.dim : C.green}`,
                                        borderRadius: 3, color: acTimer ? C.dim : C.green
                                    }}>
                                    ALL CLEAR<br /><span style={{ fontSize: 10 }}>{acTimer ? `${acTimer}s left` : "60s ALL"}</span>
                                </button>
                            </div>
                            {active.length > 0 && !allClear && (
                                <div style={{ padding: "5px 8px", background: "#160008", border: `1px solid ${blink ? C.red : C.dim}`, borderRadius: 3, transition: "border-color 0.3s" }}>
                                    <div style={lbl("▶ AUDIO ALERT SOUNDING", blink ? C.red : C.dim, 11, true)}>▶ AUDIO ALERT SOUNDING</div>
                                    <div style={lbl(`DIR: ${active[0].bearing}° | ${active[0].zone === "IMMEDIATE" ? "CONTINUOUS" : "2Hz PULSE"}`, C.dim, 10)}>
                                        DIR: {active[0].bearing}° | {active[0].zone === "IMMEDIATE" ? "CONTINUOUS TONE" : "2Hz PULSE"}
                                    </div>
                                </div>
                            )}
                            {allClear && (
                                <div style={{ padding: "5px 8px", background: "#001600", border: `1px solid ${C.green}`, borderRadius: 3 }}>
                                    <div style={lbl(`ALL CLEAR — ${acTimer}s REMAINING`, C.green, 11, true)}>ALL CLEAR — {acTimer}s REMAINING</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: panels 2+3 */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>

                        {/* Panel 2 */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>


                            <div style={{ background: '#11223d', padding: '10px', marginTop: "10px" }}>


                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center", }}>
                                    <span style={lbl(`PANEL 2 — CAMERA FEED: ${display?.cam || "—"}`, C.blue, 10)}>
                                        PANEL 2 — CAMERA FEED: {display?.cam || "—"}
                                    </span>
                                    {display && <span style={{
                                        ...lbl(display.zone, display.color, 10), background: display.color + "22",
                                        padding: "2px 6px", borderRadius: 2, border: `1px solid ${display.color}55`
                                    }}>
                                        {display.zone} — {display.range}m
                                    </span>}
                                </div>
                                <div style={{
                                    height: 300, background: C.panel, border: `1px solid ${display ? display.color + "44" : C.border}`,
                                    borderRadius: 4, overflow: "hidden"
                                }}>
                                    <CameraFeed threat={display} nightMode={nightMode} />
                                </div>
                            </div>
                        </div>

                        {/* Panels 3 + 4 side by side */}
                        <div style={{ display: "flex", gap: 8 }}>
                            <div style={{ width: 230, display: "flex", flexDirection: "column", gap: 4 }}>

                                <div style={{ background: '#11223d', padding: '10px', }}>
                                    <span style={lbl("PANEL 3 — IPM NEAR-FIELD STITCH 0–15m", C.blue, 10)}>PANEL 3 — IPM NEAR-FIELD STITCH 0–15m</span>
                                    <div style={{ height: 130, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }}>
                                        <NearField nightMode={nightMode} mode={mode} />
                                    </div>
                                    <div style={{ background: "#031128", marginTop: 8, border: `1px solid ${C.dimmer}`, borderRadius: 3, padding: "6px 8px" }}>
                                        <div style={lbl("WHAT THIS PANEL IS:", C.dim, 10, true)}>WHAT PANEL 3 IS:</div>
                                        <div style={{ ...lbl("The 360° stitched camera ring warped to top-down view. Valid only 0–15m. Beyond 15m IPM geometry breaks — long-range threats are shown on Panel 1 threat map as icons, not camera pixels.", C.white + "88", 10), lineHeight: 1.6, marginTop: 3 }}>
                                            Stitched 360° ring warped top-down. Valid 0–15m only. Beyond 15m = Panel 1 icons.
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                                <div style={{ background: '#11223d', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
                                    <span style={lbl("PANEL 4 — 360° PANORAMIC STRIP — FULL CAMERA RING UNROLLED", C.blue, 10)}>
                                        PANEL 4 — 360° PANORAMIC STRIP — FULL CAMERA RING UNROLLED
                                    </span>
                                    <div style={{ flex: 1, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden", minHeight: 130 }}>
                                        <PanoStrip threats={visible} mode={mode} nightMode={nightMode} tick={tick} />
                                    </div>
                                    <div style={{ background: "#031128", marginTop: 8, border: `1px solid ${C.dimmer}`, borderRadius: 3, padding: "6px 8px" }}>
                                        <div style={lbl("WHAT THIS PANEL IS:", C.dim, 10, true)}>WHAT PANEL 4 IS:</div>
                                        <div style={{ ...lbl("The full 360° camera ring unrolled into a horizontal strip (like peeling a cylinder flat). Each camera sector shown. Objects closer to vehicle sit lower in the strip. Disabled sectors (LEAD/TAIL modes) show STBY.", C.white + "88", 7), lineHeight: 1.6, marginTop: 3, fontSize: '10px' }}>
                                            Full 360° ring unrolled flat. Closer = lower. Disabled sectors show STBY.
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ ...lbl("PANEL 1: click map icons to view camera · MODES: change active sectors · ACK: suppress highest threat 30s · ALL CLEAR: silence all 60s · 🌙: thermal", C.dimmer, 10), textAlign: "center", marginTop: 4 }}>
                    Panel 1: click icons to switch camera · Modes: change active sectors · ACK: suppress highest 30s · ALL CLEAR: silence all 60s
                </div>
            </div>
        </div>
    );
}

/* ── PLACEMENT TAB ── */

function PlacementTab() {
    const [hov, setHov] = useState(null);
    const viewW = 560, viewH = 500;

    // The hull center is horizontally at 280 and vertically at 250
    const hull = `M 220 100 L 340 100 Q 380 105 390 130 L 395 370 Q 390 395 360 400 L 200 400 Q 170 395 165 370 L 160 130 Q 170 105 220 100 Z`;

    return (
        <div style={{ display: "flex", gap: 16, padding: "0 10px" }}>
            <div style={{ background: "#031128", padding: 10 }}>
                <div style={lbl("CAMERA DETAILS", C.blue, 11)}>CAMERA DETAILS TABS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {CAMS.map(cam => {
                        const col = cam.type === "THERMAL" ? C.purple : C.blue;
                        return (<div key={cam.id} onMouseEnter={() => setHov(cam)} onMouseLeave={() => setHov(null)}
                            style={{
                                display: "flex", gap: 8, alignItems: "center", padding: "4px 8px", cursor: "pointer",
                                background: hov?.id === cam.id ? "#0d1f35" : "transparent",
                                border: `1px solid ${hov?.id === cam.id ? col : C.border}`, borderRadius: 3
                            }}>
                            <span style={{ color: col, fontSize: 13, fontFamily: C.mono, fontWeight: "bold", width: 24 }}>{cam.id}</span>
                            <span style={lbl(cam.label, "#7a9ab8", 11)}>{cam.label}</span>
                            <span style={{ ...lbl(cam.type, col, 10), marginLeft: "auto" }}>{cam.type}</span>
                        </div>);
                    })}
                </div>
            </div>
            <div style={{ flex: 1, background: "#031128", padding: 10 }}>

                <div style={{ ...lbl("BMP-2 TOP-DOWN — CAMERA PLACEMENT (LOCKED)", C.blue, 8), marginBottom: 8, fontSize: 12 }}>BMP-2 TOP-DOWN — CAMERA PLACEMENT (LOCKED)</div>

                <svg width="100%" height={450} viewBox={`0 0 ${viewW} ${viewH}`} style={{ display: "block", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6 }}>
                    {/* Grid lines... */}
                    {[...Array(15)].map((_, i) => <line key={`h${i}`} x1={0} y1={i * 35} x2={viewW} y2={i * 35} stroke="#080f18" strokeWidth={0.4} />)}

                    {/* FOV Wedges */}
                    {CAMS.map(cam => {
                        const cx = cam.x * viewW, cy = (cam.y * 420) + 40;
                        const col = cam.type === "THERMAL" ? C.purple : C.blue;
                        const s = ((cam.angle - 55 - 90) * Math.PI) / 180, e = ((cam.angle + 55 - 90) * Math.PI) / 180, r = 70;
                        const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s), x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
                        const isH = hov?.id === cam.id;
                        return (<g key={cam.id} onMouseEnter={() => setHov(cam)} onMouseLeave={() => setHov(null)}>
                            <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2} Z`}
                                fill={col} fillOpacity={isH ? 0.18 : 0.06} stroke={col} strokeOpacity={isH ? 0.5 : 0.15} strokeWidth={1} />
                        </g>);
                    })}

                    <path d={hull} fill="#0d2035" stroke="#2a5070" strokeWidth={2} />

                    {/* Centered Internal Box (Turret) */}
                    {/* Midpoint (250) - half of height (32.5) = y: 217.5 */}
                    <rect x={230} y={217.5} width={100} height={65} rx={4} fill="#0a1828" stroke="#1a4060" strokeWidth={1.5} />

                    {/* FWD Marker line starts from the top of the box */}
                    <line x1={280} y1={217.5} x2={280} y2={60} stroke="#1a3a55" strokeWidth={2} />
                    <polygon points="276,64 284,64 280,50" fill="#1a4060" />
                    <text x={296} y={74} fill="#2a5570" fontSize={11} fontFamily={C.mono}>FWD</text>

                    {/* True Center Connection Point */}
                    {CAMS.map(cam => (
                        <line key={`cr${cam.id}`} x1={cam.x * viewW} y1={(cam.y * 420) + 40} x2={280} y2={250}
                            stroke={cam.type === "THERMAL" ? C.purple + "44" : C.amber + "33"} strokeWidth={1} strokeDasharray="4 3" />
                    ))}

                    {/* Centered ROXTEC MCT Hub */}
                    <circle cx={280} cy={250} r={10} fill="#1a1000" stroke={C.amber} strokeWidth={1.5} />
                    <text x={294} y={254} fill={C.amber} fontSize={10} fontFamily={C.mono}>ROXTEC MCT</text>

                    {/* Camera Nodes */}
                    {CAMS.map(cam => {
                        const cx = cam.x * viewW, cy = (cam.y * 420) + 40;
                        const col = cam.type === "THERMAL" ? C.purple : C.blue, isH = hov?.id === cam.id;
                        return (<g key={cam.id} onMouseEnter={() => setHov(cam)} onMouseLeave={() => setHov(null)} style={{ cursor: "pointer" }}>
                            <circle cx={cx} cy={cy} r={isH ? 14 : 11} fill={isH ? col + "44" : "#060f1a"} stroke={col} strokeWidth={isH ? 2 : 1.5} />
                            <text x={cx} y={cy + 4} textAnchor="middle" fill={col} fontSize={isH ? 9 : 8} fontFamily={C.mono} fontWeight="bold">{cam.id}</text>
                        </g>);
                    })}
                </svg>
            </div>
            <div style={{ width: 200, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ background: "#031128", padding: 10, minHeight: "100%" }}>
                    <div style={lbl("CAMERA DETAILS", C.blue, 11)}>CAMERA DETAILS</div>
                    {hov
                        ? <div style={{ background: C.panel, border: `1px solid ${hov.type === "THERMAL" ? C.purple : C.blue}`, borderRadius: 4, padding: 12 }}>
                            <div style={{ ...lbl(hov.label, hov.type === "THERMAL" ? C.purple : C.blue, 14, true), marginBottom: 8 }}>{hov.label}</div>
                            {[["Type", hov.type], ["Sensor", hov.type === "THERMAL" ? "FLIR Boson 640" : "onsemi AR0234"],
                            ["Interface", "GMSL2"], ["Resolution", hov.type === "THERMAL" ? "640×512" : "1920×1200"],
                            ["FOV", hov.type === "THERMAL" ? "50° HFOV" : "~111° HFOV"], ["IP", "IP67"],
                            ["Window", hov.type === "THERMAL" ? "Germanium" : "Sapphire"]
                            ].map(([k, v]) => (
                                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, paddingBottom: 5, borderBottom: `1px solid ${C.border}` }}>
                                    <span style={lbl(k, C.dim, 11)}>{k}</span><span style={lbl(v, C.white, 11)}>{v}</span>
                                </div>
                            ))}
                        </div>
                        : <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={lbl("Hover a camera", C.dimmer, 12), { fontSize: 12, color: '#f2ebeb' }} > Hover a camera to see specs</span>
                        </div>
                    }
                </div>
            </div>
        </div >
    );
}




/* ── ROOT ── */
export default function App() {
    const [tab, setTab] = useState(0);
    const tabs = [
        { label: "DRIVER DISPLAY", sub: "4-panel threat interface" },
        { label: "CAMERA PLACEMENT", sub: "BMP-2 top-down layout" },
        { label: "INSTALLATION", sub: "Hull routing sequence" },
    ];
    return (
        <div style={{ background: C.bg, minHeight: "100vh", fontFamily: C.mono, color: C.white, padding: 0, boxSizing: "border-box" }}>
            <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 10, marginBottom: 12, background: "#00193d" }}>
                <div style={{ fontSize: 11, letterSpacing: "4px", color: "#4e99cc", marginBottom: "10px" }}>IDEX DISC-14 · PS-22 · VIDVAT DEFENCE PVT. LTD.</div>
                <div style={{ fontSize: 26, fontWeight: "bold", letterSpacing: "2px", color: "#d8eaf8" }}>RATHDRISHTI-360</div>
                <div style={{ fontSize: 11, color: "#4e99cc", marginTop: '10px', letterSpacing: "2px" }}>360° SITUATIONAL AWARENESS KIT — SYSTEM VISUALISATION</div>
            </div>
            <div style={{ marginBottom: 12, padding: "0px 10px" }}>
                <div className="navbar" style={{ background: "#08172d", display: "flex", gap: '10px', padding: '10px', justifyContent: 'center' }}>

                    {tabs.map((t, i) => (
                        <button key={i} onClick={() => setTab(i)} style={{
                            padding: "6px 18px", cursor: "pointer", fontFamily: C.mono,
                            background: tab === i ? "#0d1f35" : "transparent", border: `1px solid ${tab === i ? C.blue : C.border}`,
                            borderRadius: 4, color: tab === i ? C.white : C.dim, transition: "all 0.15s"
                        }}>
                            <div style={{ fontSize: 12, letterSpacing: "0.12em", marginBottom: 1 }}>{t.label}</div>
                            <div style={{ fontSize: 10, opacity: 0.6 }}>{t.sub}</div>
                        </button>
                    ))}
                </div>
            </div>
            {tab === 0 && <DisplayTab />}
            {tab === 1 && <PlacementTab />}
            {tab === 2 && <InstallTab />}
        </div>
    );
}