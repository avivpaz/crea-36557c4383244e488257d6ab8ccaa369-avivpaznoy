import React from 'react';
import { LayerType } from './EmotionalLayer';

type Question = {
  id: number;
  text: string;
  layer: LayerType;
};

const questions: Question[] = [
  // Outer Self - Layer 1 (4 questions)
  {
    id: 1,
    text: "You often make new friends.",
    layer: 'outer',
  },
  {
    id: 2,
    text: "You usually like being with others more than being alone.",
    layer: 'outer',
  },
  {
    id: 3,
    text: "You feel okay starting a conversation with someone new.",
    layer: 'outer',
  },
  {
    id: 4,
    text: "Your friends would say you're energetic and outgoing.",
    layer: 'outer',
  },
  
  // Daily Self - Layer 2 (4 questions)
  {
    id: 5,
    text: "You usually plan ahead and finish tasks early.",
    layer: 'daily',
  },
  {
    id: 6,
    text: "You follow steps one by one without skipping.",
    layer: 'daily',
  },
  {
    id: 7,
    text: "Deadlines are hard for you.",
    layer: 'daily',
  },
  {
    id: 8,
    text: "You often do things at the last minute.",
    layer: 'daily',
  },
  
  // Inner Self - Layer 3 (4 questions)
  {
    id: 9,
    text: "You usually go with your feelings more than logic.",
    layer: 'inner',
  },
  {
    id: 10,
    text: "You stay calm even when things are stressful.",
    layer: 'inner',
  },
  {
    id: 11,
    text: "You almost never doubt your decisions.",
    layer: 'inner',
  },
  {
    id: 12,
    text: "You believe things will work out.",
    layer: 'inner',
  },
  
  // Deep Self - Layer 4 (4 questions)
  {
    id: 13,
    text: "You like trying new things and learning about them.",
    layer: 'deep',
  },
  {
    id: 14,
    text: "When feelings and facts don't match, you follow your heart.",
    layer: 'deep',
  },
  {
    id: 15,
    text: "Being kind is more important to you than being 100% honest.",
    layer: 'deep',
  },
  {
    id: 16,
    text: "If something feels right, you go with it without needing proof.",
    layer: 'deep',
  },
];

interface QuestionsProps {
  currentLayer: LayerType;
  currentQuestionId: number;
  onQuestionSelect: (questionId: number) => void;
}

const Questions: React.FC<QuestionsProps> = ({ 
  currentLayer, 
  currentQuestionId, 
  onQuestionSelect 
}) => {
  const layerQuestions = questions.filter(q => q.layer === currentLayer);
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6 capitalize">{currentLayer} Self</h2>
      
      <div className="space-y-4">
        {layerQuestions.map((question) => (
          <div 
            key={question.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all
              ${currentQuestionId === question.id 
                ? 'border-black bg-gray-50 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => onQuestionSelect(question.id)}
          >
            <p className="text-lg">{question.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export { questions };
export default Questions; 