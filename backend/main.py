from fastapi import FastAPI, HTTPException, status, Header, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import sqlite3
import os
import re
import uuid
import io
from PIL import Image

from database import init_db, get_db_connection, create_contact_message, get_contact_messages, delete_contact_message

app = FastAPI(title="Matteo Berga Portfolio API")

# Setup CORS
allowed_origins = ["http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5173", "http://127.0.0.1:5173"]
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    allowed_origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Admin Secret Passphrase Configuration
ADMIN_PASSPHRASE = os.getenv("ADMIN_PASSPHRASE", "admin123")

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Pydantic Schemas
class TagBase(BaseModel):
    name: str = Field(..., min_length=1)
    color: str = Field(..., pattern="^(sky|rose|emerald|amber|stone|violet|slate)$")

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: str

class WorkBase(BaseModel):
    title: str = Field(..., min_length=1)
    subtitle: Optional[str] = ""
    content: Optional[str] = ""
    date: Optional[str] = ""
    imageUrl: Optional[str] = ""
    draft: bool = False
    tag_ids: List[str] = []

class WorkCreate(WorkBase):
    id: str = Field(..., min_length=2)

class WorkUpdate(WorkBase):
    id: Optional[str] = None

class ContactFormInput(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    subject: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)

class PassphraseVerify(BaseModel):
    passphrase: str

# Dependency to check admin passphrase
def check_admin_passphrase(x_admin_passphrase: Optional[str] = Header(None)):
    if not x_admin_passphrase or x_admin_passphrase != ADMIN_PASSPHRASE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization passphrase."
        )
    return True

# Helper to map database rows to dict/JSON
def row_to_dict(row, conn):
    d = dict(row)
    # Convert integer draft to boolean
    d["draft"] = bool(d["draft"]) if "draft" in d else False
    
    # Fetch linked tags
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.id, t.name, t.color 
        FROM tags t 
        JOIN work_tags wt ON t.id = wt.tag_id 
        WHERE wt.work_id = ?
    """, (d["id"],))
    tag_rows = cursor.fetchall()
    d["tags"] = [{"id": r["id"], "name": r["name"], "color": r["color"]} for r in tag_rows]
    
    return d

# API Endpoints
@app.get("/api/works", response_model=List[dict])
def get_works(include_drafts: bool = False):
    conn = get_db_connection()
    if include_drafts:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM works")
        rows = cursor.fetchall()
    else:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM works WHERE draft = 0")
        rows = cursor.fetchall()
    
    works_list = [row_to_dict(row, conn) for row in rows]
    conn.close()
    return works_list

@app.get("/api/works/{work_id}", response_model=dict)
def get_work(work_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM works WHERE id = ?", (work_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Work item not found")
        
    work_dict = row_to_dict(row, conn)
    conn.close()
    return work_dict

@app.post("/api/admin/verify")
def verify_admin(verify_data: PassphraseVerify):
    if verify_data.passphrase == ADMIN_PASSPHRASE:
        return {"status": "authorized", "token": ADMIN_PASSPHRASE}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized. Passphrase incorrect."
    )

@app.post("/api/works", status_code=status.HTTP_201_CREATED)
def create_work(work: WorkCreate, authorized: bool = Depends(check_admin_passphrase)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if id already exists
    cursor.execute("SELECT id FROM works WHERE id = ?", (work.id,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="A work item with this ID already exists.")
        
    try:
        cursor.execute("""
        INSERT INTO works (
            id, title, subtitle, content, date, imageUrl, draft
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            work.id,
            work.title,
            work.subtitle,
            work.content,
            work.date,
            work.imageUrl,
            int(work.draft)
        ))
        
        # Link tags
        for tag_id in work.tag_ids:
            cursor.execute("INSERT INTO work_tags (work_id, tag_id) VALUES (?, ?)", (work.id, tag_id))
            
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    conn.close()
    return {"status": "created", "id": work.id}

@app.put("/api/works/{work_id}")
def update_work(work_id: str, work: WorkUpdate, authorized: bool = Depends(check_admin_passphrase)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if exists
    cursor.execute("SELECT id FROM works WHERE id = ?", (work_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Work item not found.")
        
    try:
        # Delete existing tags link first to prevent foreign key violation during ID change
        cursor.execute("DELETE FROM work_tags WHERE work_id = ?", (work_id,))
        
        new_id = work.id if work.id else work_id
        
        # Update the works record
        cursor.execute("""
        UPDATE works SET 
            id = ?,
            title = ?,
            subtitle = ?,
            content = ?,
            date = ?,
            imageUrl = ?,
            draft = ?
        WHERE id = ?
        """, (
            new_id,
            work.title,
            work.subtitle,
            work.content,
            work.date,
            work.imageUrl,
            int(work.draft),
            work_id
        ))
        
        # Insert new tag connections
        for tag_id in work.tag_ids:
            cursor.execute("INSERT INTO work_tags (work_id, tag_id) VALUES (?, ?)", (new_id, tag_id))
            
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="This slug URL identifier is already in use by another article.")
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    conn.close()
    return {"status": "updated", "id": work_id}

@app.delete("/api/works/{work_id}")
def delete_work(work_id: str, authorized: bool = Depends(check_admin_passphrase)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if exists
    cursor.execute("SELECT id FROM works WHERE id = ?", (work_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Work item not found.")
        
    try:
        # Enable foreign keys cascade delete (work_tags entries are deleted automatically)
        cursor.execute("PRAGMA foreign_keys = ON")
        cursor.execute("DELETE FROM works WHERE id = ?", (work_id,))
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    conn.close()
    return {"status": "deleted", "id": work_id}

# Tag CRUD endpoints
@app.get("/api/tags", response_model=List[TagResponse])
def get_tags():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tags")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r["id"], "name": r["name"], "color": r["color"]} for r in rows]

def slugify(text: str) -> str:
    t = text.lower().strip()
    t = re.sub(r'[^a-z0-9\-]', '', t.replace(' ', '-'))
    t = re.sub(r'-+', '-', t)
    return t

@app.post("/api/tags", status_code=status.HTTP_201_CREATED)
def create_tag(tag: TagCreate, authorized: bool = Depends(check_admin_passphrase)):
    tag_id = slugify(tag.name)
    if not tag_id:
        raise HTTPException(status_code=400, detail="Invalid tag name.")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if already exists
    cursor.execute("SELECT id FROM tags WHERE id = ?", (tag_id,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="A tag with this name already exists.")
        
    try:
        cursor.execute("INSERT INTO tags (id, name, color) VALUES (?, ?, ?)", (tag_id, tag.name, tag.color))
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    conn.close()
    return {"status": "created", "id": tag_id}

@app.put("/api/tags/{tag_id}")
def update_tag(tag_id: str, tag: TagCreate, authorized: bool = Depends(check_admin_passphrase)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM tags WHERE id = ?", (tag_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Tag not found.")
        
    try:
        cursor.execute("UPDATE tags SET name = ?, color = ? WHERE id = ?", (tag.name, tag.color, tag_id))
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    conn.close()
    return {"status": "updated", "id": tag_id}

@app.delete("/api/tags/{tag_id}")
def delete_tag(tag_id: str, authorized: bool = Depends(check_admin_passphrase)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM tags WHERE id = ?", (tag_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Tag not found.")
        
    try:
        cursor.execute("PRAGMA foreign_keys = ON")
        
        # Find works that are published (draft = 0) and only have this tag
        # We check count of tag links for each work. If it's exactly 1 and it matches tag_id,
        # this post will have 0 tags after deletion, so move it to drafts (draft = 1).
        cursor.execute("""
            SELECT w.id FROM works w
            JOIN work_tags wt ON w.id = wt.work_id
            WHERE w.draft = 0
            GROUP BY w.id
            HAVING COUNT(wt.tag_id) = 1 AND SUM(CASE WHEN wt.tag_id = ? THEN 1 ELSE 0 END) = 1
        """, (tag_id,))
        works_to_draft = cursor.fetchall()
        
        for w in works_to_draft:
            cursor.execute("UPDATE works SET draft = 1 WHERE id = ?", (w["id"],))
            
        cursor.execute("DELETE FROM tags WHERE id = ?", (tag_id,))
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    conn.close()
    return {"status": "deleted", "id": tag_id}

@app.post("/api/contact")
def submit_contact(input_data: ContactFormInput):
    import urllib.request
    import json
    try:
        create_contact_message(
            input_data.name,
            input_data.email,
            input_data.subject,
            input_data.message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save message to database: {str(e)}")

    # Check for forwarding webhook URL
    forward_url = os.getenv("CONTACT_FORWARD_URL")
    if forward_url:
        try:
            payload = {
                "name": input_data.name,
                "email": input_data.email,
                "subject": input_data.subject,
                "message": input_data.message,
                "_replyto": input_data.email
            }
            req = urllib.request.Request(
                forward_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json", "User-Agent": "FastAPI-Backend"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                pass
        except Exception as e:
            # We fail silently to the user so the form still succeeds, but log the warning
            print(f"Failed to forward contact message: {e}")

    return {"status": "success", "message": "Message transmitted successfully."}

@app.get("/api/admin/messages")
def list_messages(authorized: bool = Depends(check_admin_passphrase)):
    try:
        messages = get_contact_messages()
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/api/admin/messages/{message_id}")
def delete_msg(message_id: int, authorized: bool = Depends(check_admin_passphrase)):
    try:
        delete_contact_message(message_id)
        return {"status": "deleted", "id": message_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Image Upload and Serving Endpoints
@app.post("/api/admin/images/upload")
async def upload_image(file: UploadFile = File(...), authorized: bool = Depends(check_admin_passphrase)):
    # 1. Validate file is an image
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
        
    try:
        # 2. Read image content
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        original_width, original_height = image.size
        
        # 3. Create upload directory
        uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        
        image_id = str(uuid.uuid4())
        
        # 4. Save original image as WebP
        original_path = os.path.join(uploads_dir, f"{image_id}_original.webp")
        if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
            image.save(original_path, format="WEBP", quality=90, lossless=False)
        else:
            image.save(original_path, format="WEBP", quality=90)
            
        # 5. Generate resized WebP versions (XL: 1920, LG: 1280, MD: 768, SM: 480)
        breakpoints = {
            "1920": 1920,
            "1280": 1280,
            "768": 768,
            "480": 480
        }
        
        for size_name, max_width in breakpoints.items():
            if original_width > max_width:
                # Calculate scale maintaining aspect ratio
                new_height = int((max_width / original_width) * original_height)
                resized_image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
                resized_path = os.path.join(uploads_dir, f"{image_id}_{size_name}.webp")
                
                if resized_image.mode in ("RGBA", "LA") or (resized_image.mode == "P" and "transparency" in resized_image.info):
                    resized_image.save(resized_path, format="WEBP", quality=85, lossless=False)
                else:
                    resized_image.save(resized_path, format="WEBP", quality=85)
                    
        # 6. Save image metadata in DB
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO images (id, filename, mime_type, width, height)
            VALUES (?, ?, ?, ?, ?)
        """, (image_id, file.filename, "image/webp", original_width, original_height))
        conn.commit()
        conn.close()
        
        return {
            "id": image_id,
            "url": f"http://localhost:8000/api/images/{image_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload and processing failed: {str(e)}")

def serve_image(image_id: str, size: str):
    # Map sizing names
    size_map = {
        "xl": "1920",
        "lg": "1280",
        "md": "768",
        "sm": "480",
        "original": "original"
    }
    
    target_size = size_map.get(size.lower(), size)
    uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
    
    # 1. Check if the target size file exists
    target_path = os.path.join(uploads_dir, f"{image_id}_{target_size}.webp")
    if os.path.exists(target_path):
        return FileResponse(target_path, media_type="image/webp")
        
    # 2. Check if original exists as fallback
    original_path = os.path.join(uploads_dir, f"{image_id}_original.webp")
    if os.path.exists(original_path):
        return FileResponse(original_path, media_type="image/webp")
        
    raise HTTPException(status_code=404, detail="Image file not found on disk.")

@app.get("/api/images/{image_id}/{size}")
def serve_image_with_size(image_id: str, size: str):
    return serve_image(image_id, size)

@app.get("/api/images/{image_id}")
def serve_image_default(image_id: str):
    return serve_image(image_id, "original")
