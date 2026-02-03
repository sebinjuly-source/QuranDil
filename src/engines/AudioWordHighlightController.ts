/**
 * AudioWordHighlightController - 60fps word highlighting during audio playback
 * Uses requestAnimationFrame for smooth, performant word highlighting synchronized with audio
 */

export interface WordTimestamp {
  wordId: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  width: number;
  height: number;
  verseKey: string;
  position: number;
}

export interface HighlightStyle {
  fillColor: string;
  shadowColor: string;
  shadowBlur: number;
  padding: number;
  borderRadius: number;
}

const DEFAULT_HIGHLIGHT_STYLE: HighlightStyle = {
  fillColor: 'rgba(245, 158, 11, 0.3)', // gold with 30% opacity
  shadowColor: 'rgba(245, 158, 11, 0.5)',
  shadowBlur: 10,
  padding: 4,
  borderRadius: 8,
};

/**
 * High-performance word highlighting controller
 * - Runs at 60fps using requestAnimationFrame
 * - Uses binary search for O(log n) word lookup
 * - Imperative canvas updates (no React state)
 * - Dirty rectangle optimization
 */
export class AudioWordHighlightController {
  private rafId: number | null = null;
  private audio: HTMLAudioElement | null = null;
  private highlightCanvas: HTMLCanvasElement | null = null;
  private highlightCtx: CanvasRenderingContext2D | null = null;
  private wordTimestamps: WordTimestamp[] = [];
  private currentHighlightedWordId: string | null = null;
  private isActive: boolean = false;
  private style: HighlightStyle = DEFAULT_HIGHLIGHT_STYLE;
  private transform = { zoom: 1, panX: 0, panY: 0 };

  /**
   * Start the highlight loop
   */
  start(audio: HTMLAudioElement, highlightCanvas: HTMLCanvasElement): void {
    if (this.isActive) {
      this.stop();
    }

    this.audio = audio;
    this.highlightCanvas = highlightCanvas;
    this.highlightCtx = highlightCanvas.getContext('2d');
    
    if (!this.highlightCtx) {
      console.error('Failed to get 2D context for highlight canvas');
      return;
    }

    this.isActive = true;
    this.startLoop();
  }

  /**
   * Stop the highlight loop
   */
  stop(): void {
    this.isActive = false;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.clearHighlight();
    this.currentHighlightedWordId = null;
  }

  /**
   * Set word timestamps for current ayah
   */
  setWordTimestamps(timestamps: WordTimestamp[]): void {
    // Sort by startTime for binary search
    this.wordTimestamps = [...timestamps].sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Clear all word timestamps
   */
  clearWordTimestamps(): void {
    this.wordTimestamps = [];
    this.clearHighlight();
  }

  /**
   * Update transformation matrix (zoom/pan)
   */
  setTransform(zoom: number, panX: number, panY: number): void {
    this.transform = { zoom, panX, panY };
  }

  /**
   * Update highlight style
   */
  setStyle(style: Partial<HighlightStyle>): void {
    this.style = { ...this.style, ...style };
  }

  /**
   * Get current highlighted word ID
   */
  getCurrentHighlightedWordId(): string | null {
    return this.currentHighlightedWordId;
  }

  /**
   * Check if controller is active
   */
  isRunning(): boolean {
    return this.isActive;
  }

  /**
   * Main RAF loop
   */
  private startLoop(): void {
    const loop = () => {
      if (!this.isActive || !this.audio) {
        return;
      }

      const currentTime = this.audio.currentTime;
      const word = this.findWordAtTime(currentTime);

      // Only update if word changed (performance optimization)
      if (word && word.wordId !== this.currentHighlightedWordId) {
        this.highlightWord(word);
        this.currentHighlightedWordId = word.wordId;
      } else if (!word && this.currentHighlightedWordId !== null) {
        this.clearHighlight();
        this.currentHighlightedWordId = null;
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  /**
   * Find word at specific time using binary search
   * O(log n) performance
   */
  private findWordAtTime(time: number): WordTimestamp | null {
    if (this.wordTimestamps.length === 0) {
      return null;
    }

    let left = 0;
    let right = this.wordTimestamps.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const word = this.wordTimestamps[mid];

      if (time >= word.startTime && time <= word.endTime) {
        return word;
      } else if (time < word.startTime) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return null;
  }

  /**
   * Highlight a word on canvas (imperative)
   */
  private highlightWord(word: WordTimestamp): void {
    if (!this.highlightCtx || !this.highlightCanvas) {
      return;
    }

    const ctx = this.highlightCtx;
    const canvas = this.highlightCanvas;

    // Clear previous highlight (full canvas clear is fast for small overlays)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transform (match main canvas zoom/pan)
    ctx.scale(this.transform.zoom, this.transform.zoom);
    ctx.translate(this.transform.panX, this.transform.panY);

    // Configure highlight style
    ctx.fillStyle = this.style.fillColor;
    ctx.shadowColor = this.style.shadowColor;
    ctx.shadowBlur = this.style.shadowBlur;

    // Draw rounded rectangle highlight
    const padding = this.style.padding;
    const x = word.x - padding;
    const y = word.y - padding;
    const width = word.width + padding * 2;
    const height = word.height + padding * 2;
    const radius = this.style.borderRadius;

    // Draw rounded rect using path
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    // Restore context
    ctx.restore();
  }

  /**
   * Clear highlight from canvas
   */
  private clearHighlight(): void {
    if (!this.highlightCtx || !this.highlightCanvas) {
      return;
    }

    this.highlightCtx.clearRect(0, 0, this.highlightCanvas.width, this.highlightCanvas.height);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.audio = null;
    this.highlightCanvas = null;
    this.highlightCtx = null;
    this.wordTimestamps = [];
    this.currentHighlightedWordId = null;
  }
}
