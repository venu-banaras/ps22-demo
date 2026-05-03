import { useState } from "react";
import { C, lbl } from "../utils/constant";

/* ── INSTALL TAB ── */
export default function InstallTab() {
    const [step, setStep] = useState(0);
    const steps = [
        { title: "Mark & Drill Hull Entry", color: C.blue, desc: "A single 80mm hole is drilled through the hull at the Roxtec MCT location — typically left-side hull plate aft of the driver. This is the ONLY permanent hull penetration in the entire installation. Marked by certified welder with crew commander, accounting for internal bulkheads and fuel lines." },
        { title: "Install Roxtec MCT Fitting", color: C.amber, desc: "The Roxtec MCT frame is welded into the hole with 3-pass fillet welds. Independent rubber cable sealing modules compress around each individual cable when the plate is torqued — creating separate IP67 seals per cable. Each cable can be added or removed without disturbing others." },
        { title: "Weld Camera Brackets & Conduit", color: C.green, desc: "8 custom steel camera brackets welded at all camera positions with 3-pass fillet welds on 3 sides — same spec as hull armour welds. Certified welder. Steel conduit bolted along hull exterior between cameras and MCT, protecting GMSL2 cables from shrapnel and debris." },
        { title: "Pull Cables & Seal MCT", color: C.purple, desc: "6 GMSL2 coaxial cables + 2 USB3 thermal cables pulled through conduit and MCT. Each seated in its own rubber module. Sealing plate torqued to compress all modules simultaneously — independent IP67 seals. Excess cable coiled and secured with stainless P-clips." },
        { title: "Interior Routing to Jetson", color: C.red, desc: "Cables routed along existing hull rib channels with stainless P-clips to the Jetson enclosure. Enclosure BOLTED (not welded) to existing M10 hull rib inserts — zero additional hull penetration. Power via dedicated fused spur at existing 24V distribution panel." },
        { title: "Display & Control Panel", color: C.green, desc: "Display on vibration-damped arm bolted to driver's bulkhead at existing M8 points. ACK/ALL CLEAR/mode selector panel bolted to instrument surround with 4×M4 bolts. Speakers at ear height. All interior work fully reversible — zero internal hull drilling." },
    ];
    const W = 580, H = 300;
    const steps_active = { drill: 0, roxtec: 1, bracket: 2, conduit: 2, cable: 3, jetson: 4, display: 5 };
    const on = name => step >= steps_active[name];
    return (
        <div style={{ display: "flex", gap: 14, padding: 10 }}>
            <div style={{ width: 190, display: "flex", flexDirection: "column", gap: 5, background: "#031128", padding: '10px' }}>
                <div style={{ ...lbl("INSTALLATION SEQUENCE", C.blue, 11), marginBottom: 4 }}>INSTALLATION SEQUENCE</div>
                {steps.map((s, i) => (
                    <button key={i} onClick={() => setStep(i)} style={{
                        textAlign: "left", padding: "7px 9px", cursor: "pointer",
                        background: step === i ? s.color + "22" : C.panel, border: `1px solid ${step === i ? s.color : C.border}`,
                        borderRadius: 3, fontFamily: C.mono, color: step === i ? C.white : C.dim
                    }}>
                        <div style={{ fontSize: 10, color: s.color, letterSpacing: "0.1em", marginBottom: 2 }}>STEP {i + 1}</div>
                        <div style={{ fontSize: 11, letterSpacing: "0.05em", lineHeight: 1.4 }}>{s.title}</div>
                    </button>
                ))}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, background: "#031128", padding: 10 }}>
                <div style={lbl(`STEP ${step + 1}: ${steps[step].title}`, steps[step].color, 13, true)}>STEP {step + 1}: {steps[step].title.toUpperCase()}</div>
                <div style={{ background: C.panel, border: `1px solid ${steps[step].color}44`, borderRadius: 4, overflow: "hidden" }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
                        <rect x={0} y={0} width={W} height={H} fill="#040b14" />
                        <rect x={0} y={228} width={W} height={72} fill="#050e18" />
                        <rect x={55} y={62} width={22} height={178} rx={2} fill={on("bracket") ? "#1a2a3a" : "#0d1a28"}
                            stroke={on("bracket") ? "#2a5a8a" : "#1a3050"} strokeWidth={2} />
                        <text x={66} y={55} textAnchor="middle" fill="#1a3050" fontSize={10} fontFamily={C.mono}>HULL RHA</text>
                        <rect x={77} y={62} width={390} height={166} fill="#050c16" stroke="#0d1a28" strokeWidth={1} />
                        <text x={275} y={85} textAnchor="middle" fill="#0a1624" fontSize={12} fontFamily={C.mono}>HULL INTERIOR</text>
                        {on("bracket") && <>
                            <rect x={28} y={92} width={28} height={52} rx={2} fill="#1a2a3a" stroke={steps[step].color} strokeWidth={step === 2 ? 2.5 : 1.5} />
                            <rect x={10} y={102} width={20} height={32} rx={3} fill="#0d1a28" stroke={steps[step].color} strokeWidth={1.5} />
                            <circle cx={20} cy={118} r={7} fill="#020810" stroke={steps[step].color} strokeWidth={1} />
                            <circle cx={20} cy={118} r={3} fill={steps[step].color} fillOpacity={0.5} />
                            <text x={20} y={145} textAnchor="middle" fill={steps[step].color} fontSize={5.5} fontFamily={C.mono}>AR0234</text>
                        </>}
                        {on("conduit") && <rect x={10} y={88} width={46} height={7} rx={2} fill="#0d1a28" stroke={step === 2 ? steps[step].color : C.blue + "88"} strokeWidth={1.5} />}
                        {on("drill") && <>
                            <rect x={55} y={140} width={22} height={28} rx={0} fill={step === 0 ? steps[step].color + "33" : "#040b14"}
                                stroke={steps[step].color} strokeWidth={step === 0 ? 2.5 : 1} />
                            {step === 0 && <><line x1={66} y1={140} x2={66} y2={48} stroke={steps[step].color} strokeWidth={1} strokeDasharray="3 3" />
                                <polygon points="62,54 70,54 66,40" fill={steps[step].color} />
                                <text x={82} y={40} fill={steps[step].color} fontSize={10} fontFamily={C.mono}>80mm DRILL</text></>}
                        </>}
                        {on("roxtec") && <>
                            <rect x={52} y={137} width={28} height={34} rx={2} fill="#1a1000" stroke={C.amber} strokeWidth={step === 1 ? 2.5 : 1.5} />
                            {[142, 149, 156, 163].map((y, i) => <rect key={i} x={54} y={y} width={24} height={5} rx={1} fill={C.amber + "33"} stroke={C.amber} strokeWidth={0.5} />)}
                            <text x={66} y={133} textAnchor="middle" fill={C.amber} fontSize={11} fontFamily={C.mono}>ROXTEC IP67</text>
                        </>}
                        {on("cable") && <>
                            {[143, 149, 155].map((y, i) => <line key={i} x1={10} y1={y} x2={310} y2={y} stroke={C.amber} strokeWidth={1.8} opacity={0.7} />)}
                            {[161, 167].map((y, i) => <line key={i} x1={10} y1={y} x2={310} y2={y} stroke={C.purple} strokeWidth={1.8} opacity={0.7} />)}
                            <text x={160} y={137} textAnchor="middle" fill={C.amber} fontSize={11} fontFamily={C.mono}>6× GMSL2</text>
                            <text x={160} y={178} textAnchor="middle" fill={C.purple} fontSize={11} fontFamily={C.mono}>2× USB3 THERMAL</text>
                        </>}
                        {on("jetson") && <>
                            <rect x={295} y={92} width={115} height={85} rx={3} fill="#0a1828"
                                stroke={step === 4 ? steps[step].color : C.blue} strokeWidth={step === 4 ? 2.5 : 1.5} />
                            <text x={352} y={130} textAnchor="middle" fill={step === 4 ? steps[step].color : C.blue} fontSize={12} fontFamily={C.mono}>JETSON</text>
                            <text x={352} y={143} textAnchor="middle" fill={step === 4 ? steps[step].color : C.blue} fontSize={11} fontFamily={C.mono}>AGX ORIN IND.</text>
                            <line x1={352} y1={177} x2={352} y2={210} stroke={C.red} strokeWidth={2} />
                            <text x={360} y={208} fill={C.red} fontSize={11} fontFamily={C.mono}>24V BUS</text>
                        </>}
                        {on("display") && <>
                            <rect x={428} y={78} width={52} height={36} rx={3} fill="#0a1828" stroke={C.green} strokeWidth={step === 5 ? 2.5 : 1.5} />
                            <rect x={430} y={80} width={48} height={32} rx={2} fill="#081020" />
                            <circle cx={445} cy={96} r={10} fill="none" stroke={C.red + "88"} strokeWidth={1} />
                            <circle cx={445} cy={96} r={5} fill="none" stroke={C.amber + "88"} strokeWidth={1} />
                            <line x1={454} y1={114} x2={454} y2={145} stroke={C.green} strokeWidth={2} />
                            <rect x={441} y={145} width={40} height={20} rx={2} fill="#0a1828" stroke={C.green} strokeWidth={1} />
                            <circle cx={451} cy={155} r={4} fill={C.red} opacity={0.8} />
                            <circle cx={462} cy={155} r={4} fill={C.green} opacity={0.8} />
                            <circle cx={473} cy={155} r={3} fill="#1a3050" stroke={C.blue} strokeWidth={1} />
                            <text x={488} y={159} fill={C.green} fontSize={5.5} fontFamily={C.mono}>CTRL</text>
                        </>}
                        <text x={8} y={H - 6} fill="#0d1a28" fontSize={10} fontFamily={C.mono}>CROSS-SECTION — NOT TO SCALE</text>
                    </svg>
                </div>
                <div style={{ background: "#030810", border: `1px solid ${steps[step].color}33`, borderRadius: 4, padding: "10px 14px" }}>
                    <p style={{ margin: 0, fontFamily: C.mono, fontSize: 13, color: "#9ab8cc", lineHeight: 1.8 }}>{steps[step].desc}</p>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => setStep(p => Math.max(0, p - 1))} disabled={step === 0}
                        style={{
                            fontFamily: C.mono, fontSize: 12, padding: "5px 16px", cursor: step === 0 ? "not-allowed" : "pointer",
                            background: "transparent", border: `1px solid ${C.border}`, borderRadius: 3, color: C.dim
                        }}>◀ PREV</button>
                    <button onClick={() => setStep(p => Math.min(steps.length - 1, p + 1))} disabled={step === steps.length - 1}
                        style={{
                            fontFamily: C.mono, fontSize: 12, padding: "5px 16px", cursor: step === steps.length - 1 ? "not-allowed" : "pointer",
                            background: steps[step].color + "22", border: `1px solid ${steps[step].color}`, borderRadius: 3, color: C.white
                        }}>NEXT ▶</button>
                </div>
            </div>
        </div>
    );
}