export interface TagItem {
  id: string;
  name: string;
  color: 'sky' | 'rose' | 'emerald' | 'amber' | 'stone' | 'violet' | 'slate';
}

export interface WorkItem {
  id: string;
  title: string;
  subtitle: string;
  content: string; // Detailed content (JSON blocks)
  tags: TagItem[];
  date: string;
  imageUrl?: string;
  draft?: boolean;
  created_at?: string;
}

const mockTags: Record<string, TagItem> = {
  engineering: { id: "engineering", name: "Engineering", color: "sky" },
  art: { id: "art", name: "Art", color: "rose" },
  sports: { id: "sports", name: "Sports", color: "emerald" },
  typescript: { id: "typescript", name: "TypeScript", color: "sky" },
  webassembly: { id: "webassembly", name: "WebAssembly", color: "violet" },
  ink: { id: "ink-illustration", name: "Ink Illustration", color: "stone" },
  running: { id: "running", name: "Running", color: "emerald" },
  go: { id: "go", name: "Go", color: "slate" },
  distributed: { id: "distributed-systems", name: "Distributed Systems", color: "amber" },
};

export const worksData: WorkItem[] = [
  {
    id: "compiler-from-scratch",
    title: "Building a Custom WebAssembly Compiler",
    subtitle: "A journey into language design, parsing, and code generation. Designed and implemented a tiny compiler in TypeScript that compiles a custom algebraic language down to WebAssembly (Wasm) binary format.",
    date: "2026-05-24",
    tags: [mockTags.engineering, mockTags.typescript, mockTags.webassembly],
    imageUrl: "",
    content: `### The Challenge

Most high-level codebases are far removed from execution hardware. I wanted to understand the absolute fundamentals of how code translates to execution formats. I decided to write a compiler targeting WebAssembly (Wasm) because of its sandboxed execution, simplicity, and efficiency on the web.

### Architecture & Phases

The compiler is written in TypeScript and works through three classic compiler phases:
- **Lexical Analysis (Lexer):** Tokenizes the input string into syntactical categories (keywords, identifiers, literals, operators).
- **Syntactic Analysis (Parser):** Builds an Abstract Syntax Tree (AST) using recursive descent. It validates syntax rules and enforces basic type checks.
- **Code Generation (Emitter):** Converts the AST nodes into raw WebAssembly binary format (using the Wasm binary encoding specification), writing LEB128-encoded integers and instruction bytecodes directly to an ArrayBuffer.

![[image: https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200 | layout: wide | caption: Visualizing WebAssembly stack machine parsing stages.]]

### What I Learned

Writing this compiler demystified low-level byte representation and stack machines. WebAssembly operates on a stack-based instruction set, so converting infix mathematical expressions into postfix stack operations was a delightful logic puzzle.

Moving forward, I plan to add basic memory allocations and garbage collection mocks to handle arrays and complex structures.`
  },
  {
    id: "monochrome-studies",
    title: "Shadows in Ink: A Monochrome Study",
    subtitle: "Exploring high-contrast lighting and organic textures with traditional ink. A series of traditional ink and brush illustrations focused on light interaction, shadows, and natural patterns.",
    date: "2026-04-12",
    tags: [mockTags.art, mockTags.ink],
    imageUrl: "",
    content: `### Creative Philosophy

Monochromatic art strips away the distraction of color, forcing both the artist and the viewer to focus entirely on values, form, composition, and texture. This series was born from my daily sketches, looking for a way to translate natural structures (tree bark, water ripples, and muscular tension) using black sumi ink.

![[image: https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200 | layout: wide | caption: Sumi brush strokes on cotton paper.]]

### Tools & Techniques

I used traditional Japanese Sumi ink, Kolinsky sable round brushes, and heavy cold-press cotton paper (300gsm) to achieve raw, textured edges. The primary technique used was dry-brushing, which leaves tiny white flecks of paper showing through the brush strokes, mimicking natural light reflection on surfaces.

![[carousel: https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800, https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800 | captions: Brush flow and pressure exercises, High contrast values details]]

### Intersection with Engineering

As a computer engineer, I see a strong parallel between ink drawing and writing code. With ink, there is no "undo" button. Once a brushstroke is committed to paper, it must be integrated into the final piece. This requires deep focus, steady pacing, and structural planning—much like designing a clean API or a reliable database schema.`
  },
  {
    id: "sub-3-marathon",
    title: "Breaking the 3-Hour Marathon Barrier",
    subtitle: "A detailed breakdown of training cycles, nutrition, and mental stamina. Documented the structured 16-week block, physiological stats, and mental strategies that led to a 2:57:42 marathon finish.",
    date: "2026-03-08",
    tags: [mockTags.sports, mockTags.running],
    imageUrl: "",
    content: `### The Goal

For amateur marathoners, the sub-3 hour mark represents a standard of performance that requires structured training and precise pacing (4:15 per kilometer or 6:51 per mile). After two failed attempts, I set out to systematically track my training, recovery, and cardiac trends to optimize the performance block.

### The Training Block

My training was structured around three key pillars:
- **Consistent Volume:** Averaging 85–100 km (53–62 miles) per week, focusing on aerobic threshold runs.
- **Speed & Tempo Work:** Weekly track sessions (e.g., 5x2000m at threshold) to improve running economy.
- **Precision Nutrition:** Fueling with high-carb intake (90g per hour) during long runs to train the gut.

![[image: https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=1200 | layout: wide | caption: Aerobic conditioning volume building phases.]]

### Data Analysis (The Engineer's Perspective)

I collected heart rate, pace, and running dynamics data using my smartwatch. By plotting my resting heart rate (RHR) against weekly volume, I could identify early signs of overtraining or poor recovery. Seeing the downward trend in heart rate at marathon pace over the weeks provided a massive psychological boost before race day.

### Race Day Execution

Pacing was exceptionally even. I crossed the half-marathon mark at 1:28:30 and finished strong with a slight negative split, clocking in at 2:57:42. Running teaches me discipline, patience, and how to deal with discomfort—lessons that directly carry over to code debugging sessions and long artistic projects.`
  },
  {
    id: "distributed-database",
    title: "Distributed Key-Value Store from Scratch",
    subtitle: "Implementing raft consensus for a distributed, replication-resilient store. Built a distributed key-value store in Go implementing the Raft consensus algorithm, featuring leader election, log replication, and linearizable reads.",
    date: "2026-01-15",
    tags: [mockTags.engineering, mockTags.go, mockTags.distributed],
    imageUrl: "",
    content: `### Distributed Consensus

How do we ensure multiple independent servers agree on a sequence of state updates, even when network partitions and node crashes occur? This project answers that by implementing the Raft consensus algorithm.

### Key Implementation Details

- **Leader Election:** Heartbeats, randomized election timeouts, and request/response voting protocols.
- **Log Replication:** AppendEntries RPCs, matching indices, and state machine commits.
- **Linearizable Reads:** Ensuring that read requests return the most up-to-date committed data by checking leader authority before returning results.

![[image: https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200 | layout: center | caption: Node consensus status overview diagram.]]

This project gave me first-hand experience with concurrency primitives, network socket programming, and debugging complex race conditions.`
  },
  {
    id: "sketches-of-motion",
    title: "Sketches of Motion: Figure & Movement studies",
    subtitle: "Capturing dynamic athletic movement in quick gestures. A digital drawing collection capturing runners, cyclists, and swimmers in mid-movement using high-contrast lighting.",
    date: "2025-12-05",
    tags: [mockTags.art],
    imageUrl: "",
    content: `### Capturing Energy

Athletic gestures happen in split seconds. In this digital drawing project, I wanted to capture the sheer force, tension, and release of energy that happens when an athlete pushes their limit.

### Digital Process

I used a digital tablet with a pressure-sensitive stylus, mimicking charcoal and dry pastel brushes. The focus was on speed—each sketch was completed in under 10 minutes to prevent over-analyzing and to capture the direct flow of energy.

![[image: https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=1200 | layout: center | caption: High gesture speed and flow values.]]

The result is a set of expressive sketches where details are omitted, but the momentum and physiological balance are clearly felt.`
  },
  {
    id: "brutalist-scaffolding",
    title: "Echoes of Silence: Brutalist Scaffolding",
    subtitle: "A monochrome architectural photography series exploring raw concrete interfaces. High-contrast captures highlighting structural shapes.",
    date: "2025-10-20",
    tags: [mockTags.art, mockTags.ink],
    imageUrl: "",
    content: `### Form & Materiality

Brutalist structures capture a raw, unapologetic presence. By removing color, the photographs emphasize the texture of wood-imprinted concrete, sharp geometric intersections, and the shadows cast by temporary scaffolding structures.`
  },
  {
    id: "functional-haskell",
    title: "Type-Driven Design in Haskell",
    subtitle: "Exploring pure algebraic data types and functional composition in language parsing. Writing robust, verification-resilient parsers.",
    date: "2025-09-10",
    tags: [mockTags.engineering],
    imageUrl: "",
    content: `### Why Haskell?

Functional programming patterns provide mathematical guarantees. Using Haskell's parser combinators, we can construct complex syntactical analyzers that are guaranteed to fail at compile-time rather than runtime.`
  },
  {
    id: "geometry-of-light",
    title: "The Geometry of Light",
    subtitle: "Moody street photography capturing late afternoon light beams. Analyzing visual patterns of shadows in municipal alleys.",
    date: "2025-08-01",
    tags: [mockTags.art],
    imageUrl: "",
    content: `### Chasing Rays

Alleys function as giant light stencils. During the golden hour, concrete walls act as canvas projection fields, capturing silhouettes and dust particles in sharp geometric light beams.`
  },
  {
    id: "golang-webserver",
    title: "Building an Ultra-Fast Web Server",
    subtitle: "Implementing custom socket loops and HTTP parser configurations in pure Go. Bypassing default netsock allocations.",
    date: "2025-06-15",
    tags: [mockTags.engineering, mockTags.go, mockTags.distributed],
    imageUrl: "",
    content: `### Low-level Optimization

Standard libraries are built for generic cases. By directly reading from OS socket queues and parsing HTTP byte buffers manually, we cut allocation overhead in half, resulting in near-instant request processing times.`
  },
  {
    id: "peaks-trailrunning",
    title: "Ultra Running: Training for the Peaks",
    subtitle: "Physiological block breakdowns for high-altitude endurance. Structuring oxygen intake and tempo intervals on mountain terrain.",
    date: "2025-04-05",
    tags: [mockTags.sports, mockTags.running],
    imageUrl: "",
    content: `### Altitude Conditioning

Endurance training on mountain ridges demands both physical grit and metabolic efficiency. Structuring running sessions around elevation changes builds stamina and increases aerobic capacity.`
  }
];
