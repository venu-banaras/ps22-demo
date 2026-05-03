export const C = {
    bg: "#040b14", panel: "#070e1a", border: "#4177c2",
    red: "#e8203a", amber: "#f5a623", green: "#27ae60",
    blue: "#4a90d9", yellow: "#e8d400", purple: "#9b59b6",
    white: "#e8f0f8", dim: "#6ab4ff", dimmer: "#162030",
    mono: "Poppins",
};


export const MODES = {
    FULL: { power: "~100W", active: ["FRONT", "FLANK", "REAR"], color: C.green, desc: "All 8 sensors active. Standalone operation." },
    LEAD: { power: "~65W", active: ["FRONT", "FLANK"], color: C.amber, desc: "Front+flanks active. Rear disabled — eliminates friendly-force false alerts from convoy behind." },
    TAIL: { power: "~65W", active: ["REAR", "FLANK"], color: C.amber, desc: "Rear+flanks active. Front disabled — eliminates false alerts from convoy ahead." },
    STATIC: { power: "~40W", active: ["FRONT", "FLANK", "REAR"], color: C.blue, desc: "All sensors at 5fps. Battery-save for checkpoints and rest halts." },
};


export const CAMS = [
    { id: "FL", label: "FRONT-LEFT", angle: 315, type: "RGB", sector: "FRONT", x: 0.28, y: 0.18 },
    { id: "FM", label: "FRONT-MID", angle: 0, type: "THERMAL", sector: "FRONT", x: 0.5, y: 0.12 },
    { id: "FR", label: "FRONT-RIGHT", angle: 45, type: "RGB", sector: "FRONT", x: 0.72, y: 0.18 },
    { id: "RM", label: "RIGHT-MID", angle: 90, type: "RGB", sector: "FLANK", x: 0.82, y: 0.5 },
    { id: "RR", label: "REAR-RIGHT", angle: 135, type: "RGB", sector: "REAR", x: 0.72, y: 0.82 },
    { id: "BM", label: "REAR-MID", angle: 180, type: "THERMAL", sector: "REAR", x: 0.5, y: 0.88 },
    { id: "RL", label: "REAR-LEFT", angle: 225, type: "RGB", sector: "REAR", x: 0.28, y: 0.82 },
    { id: "LM", label: "LEFT-MID", angle: 270, type: "RGB", sector: "FLANK", x: 0.18, y: 0.5 },
];
export const ALL_THREATS = [
    { id: 1, cls: "HUMAN", bearing: 310, range: 23, cam: "REAR-LEFT", sector: "REAR", color: C.red, zone: "IMMEDIATE", moving: true, conf: 96 },
    { id: 2, cls: "HUMAN", bearing: 75, range: 118, cam: "FRONT-RIGHT", sector: "FRONT", color: C.amber, zone: "CAUTION", moving: false, conf: 91 },
    { id: 3, cls: "VEHICLE", bearing: 180, range: 210, cam: "REAR-MID", sector: "REAR", color: C.blue, zone: "MONITOR", moving: true, conf: 88 },
    { id: 4, cls: "HUMAN", bearing: 235, range: 265, cam: "LEFT-MID", sector: "FLANK", color: C.yellow, zone: "AWARENESS", moving: false, conf: 83 },
];
export const lbl = (t, col = C.dim, sz = 12, bold = false) => ({ fontFamily: C.mono, fontSize: sz, color: col, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: bold ? "bold" : "normal" });
