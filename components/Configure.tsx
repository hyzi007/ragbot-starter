import { useState } from "react";
import { X, Cpu, Search, Zap } from 'lucide-react';
import { SimilarityMetric } from "../app/hooks/useConfiguration";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  useRag: boolean;
  llm: string;
  similarityMetric: SimilarityMetric;
  setConfiguration: (useRag: boolean, llm: string, similarityMetric: SimilarityMetric) => void;
}

const Configure = ({ isOpen, onClose, useRag, llm, similarityMetric, setConfiguration }: Props) => {
  const [rag, setRag] = useState(useRag);
  const [selectedLlm, setSelectedLlm] = useState(llm);
  const [selectedSimilarityMetric, setSelectedSimilarityMetric] = useState<SimilarityMetric>(similarityMetric);
  
  if (!isOpen) return null;

  const llmOptions = [
    { label: 'GPT 3.5 Turbo', value: 'gpt-3.5-turbo', description: 'Rychlý a efektivní' },
    { label: 'GPT 4', value: 'gpt-4', description: 'Nejvýkonnější model' }
  ];

  const similarityMetricOptions = [
    { label: 'Cosine', value: 'cosine', icon: '∠' },
    { label: 'Euclidean', value: 'euclidean', icon: '√' },
    { label: 'Dot Product', value: 'dot_product', icon: '•' }
  ];

  const handleSave = () => {
    setConfiguration(rag, selectedLlm, selectedSimilarityMetric);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              Nastavení
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* LLM Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Model AI
              </label>
              <div className="grid grid-cols-2 gap-3">
                {llmOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedLlm(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedLlm === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* RAG Toggle */}
            <div>
              <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Vektorové vyhledávání (RAG)
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Použít znalostní databázi pro odpovědi
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rag}
                    onChange={(e) => setRag(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    rag ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      rag ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>
              </label>
            </div>

            {/* Similarity Metric */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Metrika podobnosti
              </label>
              <div className="grid grid-cols-3 gap-2">
                {similarityMetricOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedSimilarityMetric(option.value as SimilarityMetric)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedSimilarityMetric === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Zrušit
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Uložit změny
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configure;