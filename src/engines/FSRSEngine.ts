/**
 * FSRSEngine - Spaced Repetition Core using simplified FSRS algorithm
 * Optimized for Quran memorization (Hifz)
 */

export enum Rating {
  Again = 1, // Complete forget - reset card
  Hard = 2,  // Difficult recall - short interval
  Good = 3,  // Correct recall - normal interval
  Easy = 4,  // Perfect recall - longer interval
}

export enum CardState {
  New = 'new',
  Learning = 'learning',
  Review = 'review',
  Relearning = 'relearning',
}

export interface FSRSCard {
  /** Unique identifier for the card */
  id: string;
  
  /** Current state of the card */
  state: CardState;
  
  /** Stability - how long the memory will last (in days) */
  stability: number;
  
  /** Difficulty - how hard this card is (0-10) */
  difficulty: number;
  
  /** Number of reviews */
  reps: number;
  
  /** Number of lapses (times forgotten) */
  lapses: number;
  
  /** Due date for next review */
  due: Date;
  
  /** Last review date */
  last_review?: Date;
  
  /** Interval in days until next review */
  interval: number;
  
  /** Elapsed days since last review */
  elapsed_days?: number;
}

export interface FSRSParameters {
  /** Weight for calculating memory stability */
  w: number[];
  
  /** Learning steps for new cards (in minutes) */
  learning_steps: number[];
  
  /** Relearning steps for forgotten cards (in minutes) */
  relearning_steps: number[];
  
  /** Maximum interval in days */
  maximum_interval: number;
  
  /** Desired retention rate (0-1) */
  request_retention: number;
}

/**
 * Simplified FSRS (Free Spaced Repetition Scheduler) Engine
 * Optimized for Quran memorization
 */
export class FSRSEngine {
  private params: FSRSParameters;

  /**
   * Create a new FSRS engine with Hifz-optimized parameters
   * @param customParams Optional custom parameters
   */
  constructor(customParams?: Partial<FSRSParameters>) {
    // Default parameters optimized for Quran memorization
    this.params = {
      // FSRS-4.5 default weights (simplified for Hifz)
      w: [
        0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14,
        0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61
      ],
      learning_steps: [1, 10], // 1 min, 10 min for new cards
      relearning_steps: [10], // 10 min for forgotten cards
      maximum_interval: 365, // Max 1 year
      request_retention: 0.9, // 90% retention target
      ...customParams,
    };
  }

  /**
   * Create a new card
   * @param id Unique identifier (e.g., "page_1" or "ayah_2_255")
   * @returns New card object
   */
  createCard(id: string): FSRSCard {
    return {
      id,
      state: CardState.New,
      stability: 0,
      difficulty: 5, // Default medium difficulty
      reps: 0,
      lapses: 0,
      due: new Date(),
      interval: 0,
    };
  }

  /**
   * Rate a card and calculate next review
   * @param card Current card state
   * @param rating User rating (1-4)
   * @returns Updated card with new schedule
   */
  rateCard(card: FSRSCard, rating: Rating): FSRSCard {
    const now = new Date();
    const elapsed_days = card.last_review 
      ? Math.max(0, (now.getTime() - card.last_review.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    let newCard: FSRSCard = {
      ...card,
      last_review: now,
      elapsed_days,
      reps: card.reps + 1,
    };

    // Handle rating based on current state
    switch (card.state) {
      case CardState.New:
        newCard = this.handleNewCard(newCard, rating);
        break;
      
      case CardState.Learning:
      case CardState.Relearning:
        newCard = this.handleLearningCard(newCard, rating);
        break;
      
      case CardState.Review:
        newCard = this.handleReviewCard(newCard, rating);
        break;
    }

    return newCard;
  }

  /**
   * Handle rating for new cards
   */
  private handleNewCard(card: FSRSCard, rating: Rating): FSRSCard {
    if (rating === Rating.Again) {
      // Stay in learning with first step
      return {
        ...card,
        state: CardState.Learning,
        interval: this.params.learning_steps[0],
        due: this.addMinutes(new Date(), this.params.learning_steps[0]),
      };
    }

    // Move to learning with appropriate step
    const stepIndex = rating === Rating.Easy ? this.params.learning_steps.length - 1 : 0;
    const step = this.params.learning_steps[stepIndex] || this.params.learning_steps[0];

    if (rating === Rating.Easy && this.params.learning_steps.length === 1) {
      // Graduate immediately
      const stability = this.calculateInitialStability(card.difficulty);
      const interval = this.stabilityToInterval(stability);
      
      return {
        ...card,
        state: CardState.Review,
        stability,
        interval,
        due: this.addDays(new Date(), interval),
      };
    }

    return {
      ...card,
      state: CardState.Learning,
      interval: step,
      due: this.addMinutes(new Date(), step),
    };
  }

  /**
   * Handle rating for learning/relearning cards
   */
  private handleLearningCard(card: FSRSCard, rating: Rating): FSRSCard {
    if (rating === Rating.Again) {
      // Reset to first step
      const step = card.state === CardState.Learning 
        ? this.params.learning_steps[0]
        : this.params.relearning_steps[0];
      
      return {
        ...card,
        interval: step,
        due: this.addMinutes(new Date(), step),
        lapses: card.state === CardState.Relearning ? card.lapses + 1 : card.lapses,
      };
    }

    // Graduate to review state
    const difficulty = this.calculateDifficulty(card.difficulty, rating);
    const stability = this.calculateInitialStability(difficulty);
    const interval = this.stabilityToInterval(stability);

    return {
      ...card,
      state: CardState.Review,
      difficulty,
      stability,
      interval,
      due: this.addDays(new Date(), interval),
    };
  }

  /**
   * Handle rating for review cards
   */
  private handleReviewCard(card: FSRSCard, rating: Rating): FSRSCard {
    if (rating === Rating.Again) {
      // Lapse - move to relearning
      const step = this.params.relearning_steps[0];
      
      return {
        ...card,
        state: CardState.Relearning,
        lapses: card.lapses + 1,
        interval: step,
        due: this.addMinutes(new Date(), step),
      };
    }

    // Update difficulty and stability
    const difficulty = this.calculateDifficulty(card.difficulty, rating);
    const stability = this.calculateStability(
      card.stability,
      card.difficulty,
      difficulty,
      rating,
      card.elapsed_days ?? 0
    );
    const interval = this.stabilityToInterval(stability);

    return {
      ...card,
      state: CardState.Review,
      difficulty,
      stability,
      interval,
      due: this.addDays(new Date(), interval),
    };
  }

  /**
   * Calculate initial stability for a new card
   */
  private calculateInitialStability(difficulty: number): number {
    return this.params.w[0] + this.params.w[1] * (11 - difficulty);
  }

  /**
   * Calculate new difficulty after rating
   */
  private calculateDifficulty(currentDifficulty: number, rating: Rating): number {
    const w3 = this.params.w[3];
    const w4 = this.params.w[4];
    
    const delta = w3 - (rating - 3) * w4;
    const newDifficulty = currentDifficulty - delta;
    
    // Clamp between 1 and 10
    return Math.max(1, Math.min(10, newDifficulty));
  }

  /**
   * Calculate new stability after review
   */
  private calculateStability(
    oldStability: number,
    _oldDifficulty: number,
    newDifficulty: number,
    rating: Rating,
    elapsedDays: number
  ): number {
    const w5 = this.params.w[5];
    const w6 = this.params.w[6];
    const w7 = this.params.w[7];
    const w8 = this.params.w[8];
    
    const retention = Math.pow(1 + elapsedDays / (9 * oldStability), -1);
    
    let newStability = oldStability * (
      1 + 
      Math.exp(w5) * 
      (11 - newDifficulty) * 
      Math.pow(oldStability, w6) * 
      (Math.exp((1 - retention) * w7) - 1) * 
      w8
    );

    // Apply rating factor
    if (rating === Rating.Hard) {
      newStability *= 0.8;
    } else if (rating === Rating.Easy) {
      newStability *= 1.3;
    }

    return Math.max(0.1, newStability);
  }

  /**
   * Convert stability to interval (days)
   */
  private stabilityToInterval(stability: number): number {
    const interval = Math.round(
      stability * (Math.log(this.params.request_retention) / Math.log(0.9))
    );
    
    return Math.max(1, Math.min(this.params.maximum_interval, interval));
  }

  /**
   * Add minutes to a date
   */
  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  /**
   * Add days to a date
   */
  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Get cards due for review
   * @param cards Array of cards
   * @param date Optional date to check against (defaults to now)
   * @returns Cards that are due
   */
  getDueCards(cards: FSRSCard[], date: Date = new Date()): FSRSCard[] {
    return cards.filter(card => card.due <= date);
  }

  /**
   * Get review statistics
   * @param cards Array of cards
   * @returns Statistics object
   */
  getStats(cards: FSRSCard[]): {
    total: number;
    new: number;
    learning: number;
    review: number;
    due: number;
  } {
    const now = new Date();
    
    return {
      total: cards.length,
      new: cards.filter(c => c.state === CardState.New).length,
      learning: cards.filter(c => 
        c.state === CardState.Learning || c.state === CardState.Relearning
      ).length,
      review: cards.filter(c => c.state === CardState.Review).length,
      due: cards.filter(c => c.due <= now).length,
    };
  }
}
