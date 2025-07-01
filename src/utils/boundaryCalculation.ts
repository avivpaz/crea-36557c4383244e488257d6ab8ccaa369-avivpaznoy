import { LayerType } from '@/components/EmotionalLayer';

// Mapping of slider values to boundaries
export const SLIDER_TO_BOUNDARY = {
  0: 'Point 1',
  25: 'Point 2', 
  50: 'Point 3',
  75: 'Point 4',
  100: 'Point 5'
} as const;

// Question boundary mappings based on the provided table
export const QUESTION_BOUNDARIES = {
  // Outer Self Questions (1-4)
  1: { // You often make new friends.
    0: 'withdrawal',   // Point 1
    25: 'caution',     // Point 2
    50: 'connection',  // Point 3
    75: 'openness',    // Point 4
    100: 'impulse'     // Point 5
  },
  2: { // You usually like being with others more than being alone.
    0: 'caution',      // Point 1
    25: 'anchor',      // Point 2
    50: 'connection',  // Point 3
    75: 'exploration', // Point 4
    100: 'flow'        // Point 5
  },
  3: { // You feel okay starting a conversation with someone new.
    0: 'planning',     // Point 1
    25: 'logic',       // Point 2
    50: 'clarity',     // Point 3
    75: 'impulse',     // Point 4
    100: 'openness'    // Point 5
  },
  4: { // Your friends would say you're energetic and outgoing.
    0: 'stability',    // Point 1
    25: 'anchor',      // Point 2
    50: 'flow',        // Point 3
    75: 'sensitivity', // Point 4
    100: 'exploration' // Point 5
  },
  
  // Daily Self Questions (5-8)
  5: { // You usually plan ahead and finish tasks early.
    0: 'impulse',      // Point 1
    25: 'flow',        // Point 2
    50: 'planning',    // Point 3
    75: 'order',       // Point 4
    100: 'logic'       // Point 5
  },
  6: { // You follow steps one by one without skipping.
    0: 'exploration',  // Point 1
    25: 'flow',        // Point 2
    50: 'planning',    // Point 3
    75: 'order',       // Point 4
    100: 'stability'   // Point 5
  },
  7: { // Deadlines are hard for you.
    0: 'order',        // Point 1
    25: 'sensitivity', // Point 2
    50: 'turbulence',  // Point 3
    75: 'impulse',     // Point 4
    100: 'intuition'   // Point 5
  },
  8: { // You often do things at the last minute.
    0: 'logic',        // Point 1
    25: 'order',       // Point 2
    50: 'intuition',   // Point 3
    75: 'impulse',     // Point 4
    100: 'turbulence'  // Point 5
  },
  
  // Inner Self Questions (9-12)
  9: { // You usually go with your feelings more than logic.
    0: 'logic',        // Point 1
    25: 'planning',    // Point 2
    50: 'intuition',   // Point 3
    75: 'sensitivity', // Point 4
    100: 'flow'        // Point 5
  },
  10: { // You stay calm even when things are stressful.
    0: 'turbulence',   // Point 1
    25: 'withdrawal',  // Point 2
    50: 'stability',   // Point 3
    75: 'anchor',      // Point 4
    100: 'clarity'     // Point 5
  },
  11: { // You almost never doubt your decisions.
    0: 'sensitivity',  // Point 1
    25: 'logic',       // Point 2
    50: 'clarity',     // Point 3
    75: 'planning',    // Point 4
    100: 'stability'   // Point 5
  },
  12: { // You believe things will work out.
    0: 'caution',      // Point 1
    25: 'anchor',      // Point 2
    50: 'stability',   // Point 3
    75: 'flow',        // Point 4
    100: 'exploration' // Point 5
  },
  
  // Deep Self Questions (13-16)
  13: { // You like trying new things and learning about them.
    0: 'anchor',       // Point 1
    25: 'order',       // Point 2
    50: 'openness',    // Point 3
    75: 'exploration', // Point 4
    100: 'flow'        // Point 5
  },
  14: { // When feelings and facts don't match, you follow your heart.
    0: 'logic',        // Point 1
    25: 'clarity',     // Point 2
    50: 'intuition',   // Point 3
    75: 'sensitivity', // Point 4
    100: 'impulse'     // Point 5
  },
  15: { // Being kind is more important to you than being 100% honest.
    0: 'clarity',      // Point 1
    25: 'logic',       // Point 2
    50: 'sensitivity', // Point 3
    75: 'intuition',   // Point 4
    100: 'connection'  // Point 5
  },
  16: { // If something feels right, you go with it without needing proof.
    0: 'caution',      // Point 1
    25: 'anchor',      // Point 2
    50: 'intuition',   // Point 3
    75: 'impulse',     // Point 4
    100: 'flow'        // Point 5
  }
} as const;

export type BoundaryType = 
  | 'openness' | 'connection' | 'intuition' | 'planning' | 'logic'
  | 'withdrawal' | 'caution' | 'stability' | 'impulse' | 'order'
  | 'sensitivity' | 'clarity' | 'anchor' | 'flow' | 'turbulence'
  | 'exploration';

export interface LayerResult {
  layer: LayerType;
  winningBoundary: BoundaryType;
  votes: Record<BoundaryType, number>;
}

export class BoundaryCalculator {
  private layerVotes: Record<LayerType, Record<string, number>> = {
    outer: {},
    daily: {},
    inner: {},
    deep: {}
  };

  // Add a vote for a specific question and answer
  addVote(questionId: number, sliderValue: number): BoundaryType | null {
    const questionMapping = QUESTION_BOUNDARIES[questionId as keyof typeof QUESTION_BOUNDARIES];
    if (!questionMapping) return null;

    const boundary = questionMapping[sliderValue as keyof typeof questionMapping];
    if (!boundary) return null;

    // Determine which layer this question belongs to
    const layer = this.getLayerForQuestion(questionId);
    if (!layer) return null;

    // Initialize vote count if it doesn't exist
    if (!this.layerVotes[layer][boundary]) {
      this.layerVotes[layer][boundary] = 0;
    }

    // Add the vote
    this.layerVotes[layer][boundary]++;

    return boundary as BoundaryType;
  }

  // Get the layer for a specific question ID
  private getLayerForQuestion(questionId: number): LayerType | null {
    if (questionId >= 1 && questionId <= 4) return 'outer';
    if (questionId >= 5 && questionId <= 8) return 'daily';
    if (questionId >= 9 && questionId <= 12) return 'inner';
    if (questionId >= 13 && questionId <= 16) return 'deep';
    return null;
  }

  // Calculate the winning boundary for a layer
  calculateLayerResult(layer: LayerType): LayerResult | null {
    const votes = this.layerVotes[layer];
    if (!votes || Object.keys(votes).length === 0) return null;

    // Find the boundary with the most votes
    let winningBoundary: BoundaryType | null = null;
    let maxVotes = 0;

    // Get question order for tie-breaking
    const layerQuestions = this.getQuestionsForLayer(layer);

    for (const questionId of layerQuestions) {
      const questionMapping = QUESTION_BOUNDARIES[questionId as keyof typeof QUESTION_BOUNDARIES];
      if (!questionMapping) continue;

      // Check all possible boundaries for this question in order
      for (const sliderValue of [0, 25, 50, 75, 100]) {
        const boundary = questionMapping[sliderValue as keyof typeof questionMapping] as BoundaryType;
        if (votes[boundary] && votes[boundary] > maxVotes) {
          maxVotes = votes[boundary];
          winningBoundary = boundary;
        } else if (votes[boundary] && votes[boundary] === maxVotes && !winningBoundary) {
          // Tie-breaking: first in question order wins
          winningBoundary = boundary;
        }
      }
    }

    if (!winningBoundary) return null;

    return {
      layer,
      winningBoundary,
      votes: votes as Record<BoundaryType, number>
    };
  }

  // Get question IDs for a specific layer
  private getQuestionsForLayer(layer: LayerType): number[] {
    switch (layer) {
      case 'outer': return [1, 2, 3, 4];
      case 'daily': return [5, 6, 7, 8];
      case 'inner': return [9, 10, 11, 12];
      case 'deep': return [13, 14, 15, 16];
      default: return [];
    }
  }

  // Get current votes for a layer
  getLayerVotes(layer: LayerType): Record<string, number> {
    return { ...this.layerVotes[layer] };
  }

  // Reset votes for a layer
  resetLayerVotes(layer: LayerType): void {
    this.layerVotes[layer] = {};
  }

  // Get all layer results
  getAllResults(): Record<LayerType, LayerResult | null> {
    return {
      outer: this.calculateLayerResult('outer'),
      daily: this.calculateLayerResult('daily'),
      inner: this.calculateLayerResult('inner'),
      deep: this.calculateLayerResult('deep')
    };
  }
} 