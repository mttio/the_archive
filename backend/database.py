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
    "date": "2026-05-24",
    "imageUrl": "",
    "githubUrl": "https://github.com/example/wasm-compiler",
    "externalUrl": "https://compiler-demo.example.com",
    "content": """### The Challenge

Most high-level codebases are far removed from execution hardware. I wanted to understand the absolute fundamentals of how code translates to execution formats. I decided to write a compiler targeting WebAssembly (Wasm) because of its sandboxed execution, simplicity, and efficiency on the web.

### Architecture & Phases

The compiler is written in TypeScript and works through three classic compiler phases:

- **Lexical Analysis (Lexer):** Tokenizes the input string into syntactical categories (keywords, identifiers, literals, operators).
- **Syntactic Analysis (Parser):** Builds an Abstract Syntax Tree (AST) using recursive descent. It validates syntax rules and enforces basic type checks.
- **Code Generation (Emitter):** Converts the AST nodes into raw WebAssembly binary format (using the Wasm binary encoding specification), writing LEB128-encoded integers and instruction bytecodes directly to an ArrayBuffer.

![[image: https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200 | layout: wide | caption: Visualizing WebAssembly stack machine parsing stages.]]

### What I Learned

Writing this compiler demystified low-level byte representation and stack machines. WebAssembly operates on a stack-based instruction set, so converting infix mathematical expressions into postfix stack operations was a delightful logic puzzle.

Moving forward, I plan to add basic memory allocations and garbage collection mocks to handle arrays and complex structures.""",
    "gallery": ""
  },
  {
    "id": "monochrome-studies",
    "title": "Shadows in Ink: A Monochrome Study",
    "subtitle": "Exploring high-contrast lighting and organic textures with traditional ink.",
    "description": "A series of traditional ink and brush illustrations focused on light interaction, shadows, and natural patterns.",
    "date": "2026-04-12",
    "imageUrl": "",
    "githubUrl": "",
    "externalUrl": "",
    "content": """### Creative Philosophy

Monochromatic art strips away the distraction of color, forcing both the artist and the viewer to focus entirely on values, form, composition, and texture. This series was born from my daily sketches, looking for a way to translate natural structures (tree bark, water ripples, and muscular tension) using black sumi ink.

![[image: https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200 | layout: wide | caption: Sumi brush strokes on cotton paper.]]

### Tools & Techniques

I used traditional Japanese Sumi ink, Kolinsky sable round brushes, and heavy cold-press cotton paper (300gsm) to achieve raw, textured edges. The primary technique used was dry-brushing, which leaves tiny white flecks of paper showing through the brush strokes, mimicking natural light reflection on surfaces.

![[carousel: https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800, https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800 | captions: Brush flow and pressure exercises, High contrast values details]]
---
### Intersection with Engineering

As a computer engineer, I see a strong parallel between ink drawing and writing code. With ink, there is no "undo" button. Once a brushstroke is committed to paper, it must be integrated into the final piece. This requires deep focus, steady pacing, and structural planning—much like designing a clean API or a reliable database schema.""",
    "gallery": "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800,https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800"
  },
  {
    "id": "sub-3-marathon",
    "title": "Breaking the 3-Hour Marathon Barrier",
    "subtitle": "A detailed breakdown of training cycles, nutrition, and mental stamina.",
    "description": "Documented the structured 16-week block, physiological stats, and mental strategies that led to a 2:57:42 marathon finish.",
    "date": "2026-03-08",
    "imageUrl": "",
    "githubUrl": "",
    "externalUrl": "",
    "content": """### The Goal

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

Pacing was exceptionally even. I crossed the half-marathon mark at 1:28:30 and finished strong with a slight negative split, clocking in at 2:57:42. Running teaches me discipline, patience, and how to deal with discomfort—lessons that directly carry over to code debugging sessions and long artistic projects.""",
    "gallery": ""
  },
  {
    "id": "distributed-database",
    "title": "Distributed Key-Value Store from Scratch",
    "subtitle": "Implementing raft consensus for a distributed, replication-resilient store.",
    "description": "Built a distributed key-value store in Go implementing the Raft consensus algorithm, featuring leader election, log replication, and linearizable reads.",
    "date": "2026-01-15",
    "imageUrl": "",
    "githubUrl": "https://github.com/example/distributed-raft-kv",
    "externalUrl": "",
    "content": """### Distributed Consensus

How do we ensure multiple independent servers agree on a sequence of state updates, even when network partitions and node crashes occur? This project answers that by implementing the Raft consensus algorithm.

### Key Implementation Details

- **Leader Election:** Heartbeats, randomized election timeouts, and request/response voting protocols.
- **Log Replication:** AppendEntries RPCs, matching indices, and state machine commits.
- **Linearizable Reads:** Ensuring that read requests return the most up-to-date committed data by checking leader authority before returning results.

![[image: https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200 | layout: center | caption: Node consensus status overview diagram.]]

This project gave me first-hand experience with concurrency primitives, network socket programming, and debugging complex race conditions.""",
    "gallery": ""
  },
  {
    "id": "sketches-of-motion",
    "title": "Sketches of Motion: Figure & Movement studies",
    "subtitle": "Capturing dynamic athletic movement in quick gestures.",
    "description": "A digital drawing collection capturing runners, cyclists, and swimmers in mid-movement using high-contrast lighting.",
    "date": "2025-12-05",
    "imageUrl": "",
    "githubUrl": "",
    "externalUrl": "",
    "content": """### Capturing Energy

Athletic gestures happen in split seconds. In this digital drawing project, I wanted to capture the sheer force, tension, and release of energy that happens when an athlete pushes their limit.

### Digital Process

I used a digital tablet with a pressure-sensitive stylus, mimicking charcoal and dry pastel brushes. The focus was on speed—each sketch was completed in under 10 minutes to prevent over-analyzing and to capture the direct flow of energy.

![[image: https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=1200 | layout: center | caption: High gesture speed and flow values.]]

The result is a set of expressive sketches where details are omitted, but the momentum and physiological balance are clearly felt.""",
    "gallery": ""
  },
  {
    "id": "brutalist-scaffolding",
    "title": "Echoes of Silence: Brutalist Scaffolding",
    "subtitle": "A monochrome architectural photography series exploring raw concrete interfaces.",
    "description": "High-contrast captures highlighting structural shapes.",
    "date": "2025-10-20",
    "imageUrl": "",
    "githubUrl": "",
    "externalUrl": "",
    "content": """### Form & Materiality

Brutalist structures capture a raw, unapologetic presence. By removing color, the photographs emphasize the texture of wood-imprinted concrete, sharp geometric intersections, and the shadows cast by temporary scaffolding structures.""",
    "gallery": ""
  },
  {
    "id": "functional-haskell",
    "title": "Type-Driven Design in Haskell",
    "subtitle": "Exploring pure algebraic data types and functional composition in language parsing.",
    "description": "Writing robust, verification-resilient parsers.",
    "date": "2025-09-10",
    "imageUrl": "",
    "githubUrl": "",
    "externalUrl": "",
    "content": """### Why Haskell?

Functional programming patterns provide mathematical guarantees. Using Haskell's parser combinators, we can construct complex syntactical analyzers that are guaranteed to fail at compile-time rather than runtime.""",
    "gallery": ""
  },
  {
    "id": "geometry-of-light",
    "title": "The Geometry of Light",
    "subtitle": "Moody street photography capturing late afternoon light beams.",
    "description": "Analyzing visual patterns of shadows in municipal alleys.",
    "date": "2025-08-01",
    "imageUrl": "",
    "githubUrl": "",
    "externalUrl": "",
    "content": """### Chasing Rays

Alleys function as giant light stencils. During the golden hour, concrete walls act as canvas projection fields, capturing silhouettes and dust particles in sharp geometric light beams.""",
    "gallery": ""
  },
  {
    "id": "golang-webserver",
    "title": "Building an Ultra-Fast Web Server",
    "subtitle": "Implementing custom socket loops and HTTP parser configurations in pure Go.",
    "description": "Bypassing default netsock allocations.",
    "date": "2025-06-15",
    "imageUrl": "",
    "githubUrl": "",
    "externalUrl": "",
    "content": """### Low-level Optimization

Standard libraries are built for generic cases. By directly reading from OS socket queues and parsing HTTP byte buffers manually, we cut allocation overhead in half, resulting in near-instant request processing times.""",
    "gallery": ""
  },
  {
    "id": "peaks-trailrunning",
    "title": "Ultra Running: Training for the Peaks",
    "subtitle": "Physiological block breakdowns for high-altitude endurance.",
    "description": "Structuring oxygen intake and tempo intervals on mountain terrain.",
    "date": "2025-04-05",
    "imageUrl": "",
    "githubUrl": "",
    "externalUrl": "",
    "content": """### Altitude Conditioning

Endurance training on mountain ridges demands both physical grit and metabolic efficiency. Structuring running sessions around elevation changes builds stamina and increases aerobic capacity.""",
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

def init_db(force_reset: bool = False):
    uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    
    db_exists = os.path.exists(DB_PATH)
    needs_init = not db_exists or force_reset
    
    if not needs_init:
        # Check if works table already exists
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='works'")
            if not cursor.fetchone():
                needs_init = True
            else:
                # Table exists, check if created_at column is present
                cursor.execute("PRAGMA table_info(works)")
                cols = [row["name"] for row in cursor.fetchall()]
                if "created_at" not in cols:
                    print("Migration: Adding 'created_at' column to 'works' table...")
                    cursor.execute("ALTER TABLE works ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
                    conn.commit()
        except Exception as e:
            print(f"Database check/migration error: {e}")
            needs_init = True
        finally:
            conn.close()

    if not needs_init:
        print("Database already initialized. Skipping reset.")
        return

    print("Initializing database...")
    
    # Clean up uploads directory on force reset or fresh init
    for f in os.listdir(uploads_dir):
        file_path = os.path.join(uploads_dir, f)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON")
    
    # Reset database by dropping old tables if present
    cursor.execute("DROP TABLE IF EXISTS work_tags")
    cursor.execute("DROP TABLE IF EXISTS tags")
    cursor.execute("DROP TABLE IF EXISTS works")
    cursor.execute("DROP TABLE IF EXISTS contact_messages")
    cursor.execute("DROP TABLE IF EXISTS images")
    conn.commit()
    
    # Create tables
    cursor.execute("""
    CREATE TABLE images (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        width INTEGER,
        height INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE works (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        content TEXT NOT NULL,
        date TEXT NOT NULL,
        imageUrl TEXT,
        draft INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    cursor.execute("""
    CREATE TABLE contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

def create_contact_message(name: str, email: str, subject: str, message: str) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO contact_messages (name, email, subject, message)
    VALUES (?, ?, ?, ?)
    """, (name, email, subject, message))
    msg_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return msg_id

def get_contact_messages():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, subject, message, created_at FROM contact_messages ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_contact_message(message_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM contact_messages WHERE id = ?", (message_id,))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    import sys
    # Add safety check to prevent accidental database resets
    if "--force-reset" in sys.argv:
        try:
            confirm = input("WARNING: This will completely reset the database and delete all data! Type 'YES' to confirm: ")
            if confirm == "YES":
                init_db(force_reset=True)
                print("Database reset and initialized successfully.")
            else:
                print("Reset cancelled. Database was not modified.")
        except KeyboardInterrupt:
            print("\nReset cancelled.")
    else:
        print("Usage: python3 database.py --force-reset")
        print("For security reasons, running this file directly requires the '--force-reset' argument and confirmation.")
