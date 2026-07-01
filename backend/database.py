import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

# Default mock data to seed if db is empty
INITIAL_WORKS = [
  {
    "id": "compiler-from-scratch",
    "title": "Building a Custom WebAssembly Compiler",
    "subtitle": "A journey into language design, parsing, and code generation.",
    "description": "Designed and implemented a tiny compiler in TypeScript that compiles a custom algebraic language down to WebAssembly (Wasm) binary format.",
    "date": "May 2026",
    "imageUrl": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200",
    "githubUrl": "https://github.com/example/wasm-compiler",
    "externalUrl": "https://compiler-demo.example.com",
    "content": """[
      {"type": "heading", "id": "b1", "level": 3, "value": "The Challenge"},
      {"type": "text", "id": "b2", "value": "Most high-level codebases are far removed from execution hardware. I wanted to understand the absolute fundamentals of how code translates to execution formats. I decided to write a compiler targeting WebAssembly (Wasm) because of its sandboxed execution, simplicity, and efficiency on the web."},
      {"type": "heading", "id": "b3", "level": 3, "value": "Architecture & Phases"},
      {"type": "text", "id": "b4", "value": "The compiler is written in TypeScript and works through three classic compiler phases:"},
      {"type": "list", "id": "b5", "listType": "bullet", "items": [
        "**Lexical Analysis (Lexer):** Tokenizes the input string into syntactical categories (keywords, identifiers, literals, operators).",
        "**Syntactic Analysis (Parser):** Builds an Abstract Syntax Tree (AST) using recursive descent. It validates syntax rules and enforces basic type checks.",
        "**Code Generation (Emitter):** Converts the AST nodes into raw WebAssembly binary format (using the Wasm binary encoding specification), writing LEB128-encoded integers and instruction bytecodes directly to an ArrayBuffer."
      ]},
      {"type": "image", "id": "b6", "url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200", "caption": "Visualizing WebAssembly stack machine parsing stages.", "layout": "wide"},
      {"type": "heading", "id": "b7", "level": 3, "value": "What I Learned"},
      {"type": "text", "id": "b8", "value": "Writing this compiler demystified low-level byte representation and stack machines. WebAssembly operates on a stack-based instruction set, so converting infix mathematical expressions into postfix stack operations was a delightful logic puzzle.\\n\\nMoving forward, I plan to add basic memory allocations and garbage collection mocks to handle arrays and complex structures."}
    ]""",
    "gallery": ""
  },
  {
    "id": "monochrome-studies",
    "title": "Shadows in Ink: A Monochrome Study",
    "subtitle": "Exploring high-contrast lighting and organic textures with traditional ink.",
    "description": "A series of traditional ink and brush illustrations focused on light interaction, shadows, and natural patterns.",
    "date": "April 2026",
    "imageUrl": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200",
    "githubUrl": "",
    "externalUrl": "",
    "content": """[
      {"type": "heading", "id": "c1", "level": 3, "value": "Creative Philosophy"},
      {"type": "text", "id": "c2", "value": "Monochromatic art strips away the distraction of color, forcing both the artist and the viewer to focus entirely on values, form, composition, and texture. This series was born from my daily sketches, looking for a way to translate natural structures (tree bark, water ripples, and muscular tension) using black sumi ink."},
      {"type": "image", "id": "c3", "url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200", "caption": "Sumi brush strokes on cotton paper.", "layout": "wide"},
      {"type": "heading", "id": "c4", "level": 3, "value": "Tools & Techniques"},
      {"type": "text", "id": "c5", "value": "I used traditional Japanese Sumi ink, Kolinsky sable round brushes, and heavy cold-press cotton paper (300gsm) to achieve raw, textured edges. The primary technique used was dry-brushing, which leaves tiny white flecks of paper showing through the brush strokes, mimicking natural light reflection on surfaces."},
      {"type": "carousel", "id": "c6", "slides": [
        {"url": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800", "caption": "Brush flow and pressure exercises"},
        {"url": "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=800", "caption": "High contrast values details"}
      ]},
      {"type": "heading", "id": "c7", "level": 3, "value": "Intersection with Engineering"},
      {"type": "text", "id": "c8", "value": "As a computer engineer, I see a strong parallel between ink drawing and writing code. With ink, there is no \\"undo\\" button. Once a brushstroke is committed to paper, it must be integrated into the final piece. This requires deep focus, steady pacing, and structural planning—much like designing a clean API or a reliable database schema."}
    ]""",
    "gallery": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800,https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=800"
  },
  {
    "id": "sub-3-marathon",
    "title": "Breaking the 3-Hour Marathon Barrier",
    "subtitle": "A detailed breakdown of training cycles, nutrition, and mental stamina.",
    "description": "Documented the structured 16-week block, physiological stats, and mental strategies that led to a 2:57:42 marathon finish.",
    "date": "March 2026",
    "imageUrl": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1200",
    "githubUrl": "",
    "externalUrl": "",
    "content": """[
      {"type": "heading", "id": "d1", "level": 3, "value": "The Goal"},
      {"type": "text", "id": "d2", "value": "For amateur marathoners, the sub-3 hour mark represents a standard of performance that requires structured training and precise pacing (4:15 per kilometer or 6:51 per mile). After two failed attempts, I set out to systematically track my training, recovery, and cardiac trends to optimize the performance block."},
      {"type": "heading", "id": "d3", "level": 3, "value": "The Training Block"},
      {"type": "text", "id": "d4", "value": "My training was structured around three key pillars:"},
      {"type": "list", "id": "d5", "listType": "bullet", "items": [
        "**Consistent Volume:** Averaging 85–100 km (53–62 miles) per week, focusing on aerobic threshold runs.",
        "**Speed & Tempo Work:** Weekly track sessions (e.g., 5x2000m at threshold) to improve running economy.",
        "**Precision Nutrition:** Fueling with high-carb intake (90g per hour) during long runs to train the gut."
      ]},
      {"type": "image", "id": "d6", "url": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1200", "caption": "Aerobic conditioning volume building phases.", "layout": "wide"},
      {"type": "heading", "id": "d7", "level": 3, "value": "Data Analysis (The Engineer's Perspective)"},
      {"type": "text", "id": "d8", "value": "I collected heart rate, pace, and running dynamics data using my smartwatch. By plotting my resting heart rate (RHR) against weekly volume, I could identify early signs of overtraining or poor recovery. Seeing the downward trend in heart rate at marathon pace over the weeks provided a massive psychological boost before race day."},
      {"type": "heading", "id": "d9", "level": 3, "value": "Race Day Execution"},
      {"type": "text", "id": "d10", "value": "Pacing was exceptionally even. I crossed the half-marathon mark at 1:28:30 and finished strong with a slight negative split, clocking in at 2:57:42. Running teaches me discipline, patience, and how to deal with discomfort—lessons that directly carry over to code debugging sessions and long artistic projects."}
    ]""",
    "gallery": ""
  },
  {
    "id": "distributed-database",
    "title": "Distributed Key-Value Store from Scratch",
    "subtitle": "Implementing raft consensus for a distributed, replication-resilient store.",
    "description": "Built a distributed key-value store in Go implementing the Raft consensus algorithm, featuring leader election, log replication, and linearizable reads.",
    "date": "January 2026",
    "imageUrl": "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1200",
    "githubUrl": "https://github.com/example/distributed-raft-kv",
    "externalUrl": "",
    "content": """[
      {"type": "heading", "id": "e1", "level": 3, "value": "Distributed Consensus"},
      {"type": "text", "id": "e2", "value": "How do we ensure multiple independent servers agree on a sequence of state updates, even when network partitions and node crashes occur? This project answers that by implementing the Raft consensus algorithm."},
      {"type": "heading", "id": "e3", "level": 3, "value": "Key Implementation Details"},
      {"type": "list", "id": "e4", "listType": "bullet", "items": [
        "**Leader Election:** Heartbeats, randomized election timeouts, and request/response voting protocols.",
        "**Log Replication:** AppendEntries RPCs, matching indices, and state machine commits.",
        "**Linearizable Reads:** Ensuring that read requests return the most up-to-date committed data by checking leader authority before returning results."
      ]},
      {"type": "image", "id": "e5", "url": "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1200", "caption": "Node consensus status overview diagram.", "layout": "center"},
      {"type": "text", "id": "e6", "value": "This project gave me first-hand experience with concurrency primitives, network socket programming, and debugging complex race conditions."}
    ]""",
    "gallery": ""
  },
  {
    "id": "sketches-of-motion",
    "title": "Sketches of Motion: Figure & Movement studies",
    "subtitle": "Capturing dynamic athletic movement in quick gestures.",
    "description": "A digital drawing collection capturing runners, cyclists, and swimmers in mid-movement using high-contrast lighting.",
    "date": "December 2025",
    "imageUrl": "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=1200",
    "githubUrl": "",
    "externalUrl": "",
    "content": """[
      {"type": "heading", "id": "f1", "level": 3, "value": "Capturing Energy"},
      {"type": "text", "id": "f2", "value": "Athletic gestures happen in split seconds. In this digital drawing project, I wanted to capture the sheer force, tension, and release of energy that happens when an athlete pushes their limit."},
      {"type": "heading", "id": "f3", "level": 3, "value": "Digital Process"},
      {"type": "text", "id": "f4", "value": "I used a digital tablet with a pressure-sensitive stylus, mimicking charcoal and dry pastel brushes. The focus was on speed—each sketch was completed in under 10 minutes to prevent over-analyzing and to capture the direct flow of energy."},
      {"type": "image", "id": "f5", "url": "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=1200", "caption": "High gesture speed and flow values.", "layout": "center"},
      {"type": "text", "id": "f6", "value": "The result is a set of expressive sketches where details are omitted, but the momentum and physiological balance are clearly felt."}
    ]""",
    "gallery": ""
  }
]

INITIAL_TAGS = [
  {"id": "engineering", "name": "Engineering", "color": "sky"},
  {"id": "art", "name": "Art", "color": "rose"},
  {"id": "sports", "name": "Sports", "color": "emerald"},
  {"id": "typescript", "name": "TypeScript", "color": "sky"},
  {"id": "webassembly", "name": "WebAssembly", "color": "violet"},
  {"id": "ink-illustration", "name": "Ink Illustration", "color": "stone"},
  {"id": "running", "name": "Running", "color": "emerald"},
  {"id": "go", "name": "Go", "color": "slate"},
  {"id": "distributed-systems", "name": "Distributed Systems", "color": "amber"},
]

INITIAL_WORK_TAGS = {
  "compiler-from-scratch": ["engineering", "typescript", "webassembly"],
  "monochrome-studies": ["art", "ink-illustration"],
  "sub-3-marathon": ["sports", "running"],
  "distributed-database": ["engineering", "go", "distributed-systems"],
  "sketches-of-motion": ["art"]
}

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON")
    
    # Reset database by dropping old tables if present
    # We drop work_tags first since it has foreign keys referencing works and tags
    cursor.execute("DROP TABLE IF EXISTS work_tags")
    cursor.execute("DROP TABLE IF EXISTS tags")
    cursor.execute("DROP TABLE IF EXISTS works")
    conn.commit()
    
    # Create tables
    cursor.execute("""
    CREATE TABLE works (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        content TEXT NOT NULL,
        date TEXT NOT NULL,
        imageUrl TEXT,
        draft INTEGER DEFAULT 0
    )
    """)
    
    cursor.execute("""
    CREATE TABLE tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL
    )
    """)
    
    cursor.execute("""
    CREATE TABLE work_tags (
        work_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (work_id, tag_id),
        FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
    """)
    conn.commit()
    
    print("Database tables created successfully.")
    
    # Seed tags
    for tag in INITIAL_TAGS:
        cursor.execute("INSERT OR IGNORE INTO tags (id, name, color) VALUES (?, ?, ?)", 
                       (tag["id"], tag["name"], tag["color"]))
    
    # Seed works
    for item in INITIAL_WORKS:
        # Merge description into subtitle if description exists
        desc = item.get("description", "")
        sub = item["subtitle"]
        full_sub = f"{sub} {desc}".strip() if desc else sub

        cursor.execute("""
        INSERT INTO works (
            id, title, subtitle, content, date, imageUrl, draft
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            item["id"],
            item["title"],
            full_sub,
            item["content"].strip(),
            item["date"],
            item["imageUrl"],
            0 # draft = false
        ))
        
        # Link tags
        tag_ids = INITIAL_WORK_TAGS.get(item["id"], [])
        for tag_id in tag_ids:
            cursor.execute("INSERT INTO work_tags (work_id, tag_id) VALUES (?, ?)", 
                           (item["id"], tag_id))
            
    conn.commit()
    conn.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
