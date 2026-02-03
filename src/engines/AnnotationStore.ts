/**
 * AnnotationStore - Drawing and highlight persistence
 * IndexedDB-backed storage for user annotations on Quran pages
 */

const DB_NAME = 'QuranAnnotations';
const DB_VERSION = 1;
const ANNOTATIONS_STORE = 'annotations';

export enum AnnotationType {
  Drawing = 'drawing',
  Highlight = 'highlight',
  Underline = 'underline',
  Circle = 'circle',
  Note = 'note',
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingData {
  /** Array of points forming the drawing path */
  points: Point[];
  /** Stroke color */
  color: string;
  /** Stroke width */
  width: number;
  /** Optional opacity (0-1) */
  opacity?: number;
}

export interface HighlightData {
  /** Bounding box coordinates */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Highlight color */
  color: string;
  /** Optional opacity (0-1) */
  opacity?: number;
}

export interface NoteData {
  /** Note text content */
  text: string;
  /** Position on page */
  x: number;
  y: number;
}

export interface Annotation {
  /** Unique identifier */
  id: string;
  
  /** Type of annotation */
  type: AnnotationType;
  
  /** Page number this annotation belongs to */
  page_number: number;
  
  /** Optional ayah reference (verse_key like "2:255") */
  verse_key?: string;
  
  /** Annotation data (type-specific) */
  data: DrawingData | HighlightData | NoteData;
  
  /** Creation timestamp */
  created_at: Date;
  
  /** Last modified timestamp */
  modified_at: Date;
  
  /** Optional tags for organization */
  tags?: string[];
  
  /** Optional user-defined metadata */
  metadata?: Record<string, any>;
}

export interface AnnotationFilter {
  page_number?: number;
  verse_key?: string;
  type?: AnnotationType;
  tags?: string[];
}

/**
 * Annotation Store for managing user drawings and highlights
 */
export class AnnotationStore {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initDB();
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(ANNOTATIONS_STORE)) {
          const store = db.createObjectStore(ANNOTATIONS_STORE, { keyPath: 'id' });
          
          // Create indexes for efficient querying
          store.createIndex('page_number', 'page_number', { unique: false });
          store.createIndex('verse_key', 'verse_key', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('created_at', 'created_at', { unique: false });
        }
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Generate a unique ID for an annotation
   */
  private generateId(): string {
    return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add a new annotation
   * @param annotation Annotation to add (without id, created_at, modified_at)
   * @returns Created annotation with generated id and timestamps
   */
  async addAnnotation(
    annotation: Omit<Annotation, 'id' | 'created_at' | 'modified_at'>
  ): Promise<Annotation> {
    await this.ensureDB();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const now = new Date();
    const fullAnnotation: Annotation = {
      id: this.generateId(),
      created_at: now,
      modified_at: now,
      ...annotation,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ANNOTATIONS_STORE], 'readwrite');
      const store = transaction.objectStore(ANNOTATIONS_STORE);
      const request = store.add(fullAnnotation);

      request.onsuccess = () => resolve(fullAnnotation);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update an existing annotation
   * @param id Annotation ID
   * @param updates Partial annotation data to update
   * @returns Updated annotation
   */
  async updateAnnotation(
    id: string,
    updates: Partial<Omit<Annotation, 'id' | 'created_at'>>
  ): Promise<Annotation> {
    await this.ensureDB();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise(async (resolve, reject) => {
      const existing = await this.getAnnotation(id);
      if (!existing) {
        reject(new Error(`Annotation not found: ${id}`));
        return;
      }

      const updated: Annotation = {
        ...existing,
        ...updates,
        id, // Ensure id doesn't change
        created_at: existing.created_at, // Preserve creation time
        modified_at: new Date(),
      };

      const transaction = this.db!.transaction([ANNOTATIONS_STORE], 'readwrite');
      const store = transaction.objectStore(ANNOTATIONS_STORE);
      const request = store.put(updated);

      request.onsuccess = () => resolve(updated);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a specific annotation by ID
   * @param id Annotation ID
   * @returns Annotation or null if not found
   */
  async getAnnotation(id: string): Promise<Annotation | null> {
    await this.ensureDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ANNOTATIONS_STORE], 'readonly');
      const store = transaction.objectStore(ANNOTATIONS_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const annotation = request.result as Annotation | undefined;
        if (annotation) {
          // Convert date strings back to Date objects
          annotation.created_at = new Date(annotation.created_at);
          annotation.modified_at = new Date(annotation.modified_at);
        }
        resolve(annotation ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get annotations with optional filtering
   * @param filter Optional filter criteria
   * @returns Array of matching annotations
   */
  async getAnnotations(filter?: AnnotationFilter): Promise<Annotation[]> {
    await this.ensureDB();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ANNOTATIONS_STORE], 'readonly');
      const store = transaction.objectStore(ANNOTATIONS_STORE);
      
      let request: IDBRequest;

      if (filter?.page_number !== undefined) {
        const index = store.index('page_number');
        request = index.getAll(filter.page_number);
      } else if (filter?.verse_key) {
        const index = store.index('verse_key');
        request = index.getAll(filter.verse_key);
      } else if (filter?.type) {
        const index = store.index('type');
        request = index.getAll(filter.type);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        let annotations = request.result as Annotation[];
        
        // Convert date strings back to Date objects
        annotations = annotations.map(a => ({
          ...a,
          created_at: new Date(a.created_at),
          modified_at: new Date(a.modified_at),
        }));

        // Apply additional filters
        if (filter?.type && !filter.page_number && !filter.verse_key) {
          annotations = annotations.filter(a => a.type === filter.type);
        }
        if (filter?.tags && filter.tags.length > 0) {
          annotations = annotations.filter(a => 
            a.tags && filter.tags!.some(tag => a.tags!.includes(tag))
          );
        }

        resolve(annotations);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete an annotation
   * @param id Annotation ID
   * @returns True if deleted, false if not found
   */
  async deleteAnnotation(id: string): Promise<boolean> {
    await this.ensureDB();
    if (!this.db) return false;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ANNOTATIONS_STORE], 'readwrite');
      const store = transaction.objectStore(ANNOTATIONS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete all annotations for a specific page
   * @param pageNumber Page number
   * @returns Number of annotations deleted
   */
  async deletePageAnnotations(pageNumber: number): Promise<number> {
    const annotations = await this.getAnnotations({ page_number: pageNumber });
    
    for (const annotation of annotations) {
      await this.deleteAnnotation(annotation.id);
    }

    return annotations.length;
  }

  /**
   * Delete all annotations for a specific verse
   * @param verseKey Verse key (e.g., "2:255")
   * @returns Number of annotations deleted
   */
  async deleteVerseAnnotations(verseKey: string): Promise<number> {
    const annotations = await this.getAnnotations({ verse_key: verseKey });
    
    for (const annotation of annotations) {
      await this.deleteAnnotation(annotation.id);
    }

    return annotations.length;
  }

  /**
   * Clear all annotations
   */
  async clearAll(): Promise<void> {
    await this.ensureDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ANNOTATIONS_STORE], 'readwrite');
      const store = transaction.objectStore(ANNOTATIONS_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get annotation statistics
   */
  async getStats(): Promise<{
    total: number;
    byType: Record<AnnotationType, number>;
    byPage: Record<number, number>;
  }> {
    const annotations = await this.getAnnotations();
    
    const byType: Record<AnnotationType, number> = {
      [AnnotationType.Drawing]: 0,
      [AnnotationType.Highlight]: 0,
      [AnnotationType.Underline]: 0,
      [AnnotationType.Circle]: 0,
      [AnnotationType.Note]: 0,
    };

    const byPage: Record<number, number> = {};

    annotations.forEach(annotation => {
      byType[annotation.type]++;
      byPage[annotation.page_number] = (byPage[annotation.page_number] ?? 0) + 1;
    });

    return {
      total: annotations.length,
      byType,
      byPage,
    };
  }

  /**
   * Export all annotations as JSON
   */
  async exportAnnotations(): Promise<string> {
    const annotations = await this.getAnnotations();
    return JSON.stringify(annotations, null, 2);
  }

  /**
   * Import annotations from JSON
   * @param json JSON string containing annotations
   * @param clearExisting Whether to clear existing annotations first
   */
  async importAnnotations(json: string, clearExisting: boolean = false): Promise<number> {
    const annotations = JSON.parse(json) as Annotation[];
    
    if (clearExisting) {
      await this.clearAll();
    }

    for (const annotation of annotations) {
      // Remove id to generate new ones and avoid conflicts
      const { id, created_at, modified_at, ...rest } = annotation;
      await this.addAnnotation(rest);
    }

    return annotations.length;
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const annotationStore = new AnnotationStore();
