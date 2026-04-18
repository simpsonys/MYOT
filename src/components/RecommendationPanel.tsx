import { motion, AnimatePresence } from 'framer-motion';
import { useTVStore } from '../store/tvStore';

export function RecommendationPanel() {
  const { recommendations, applyLayout, setRecommendations } = useTVStore();

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold">💡 추천 레이아웃</div>
          <button
            onClick={() => setRecommendations(null)}
            className="text-xs opacity-50 hover:opacity-100"
          >
            닫기
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendations.map((rec, i) => (
            <button
              key={i}
              onClick={() => applyLayout(rec)}
              className="text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:border-myot-accent transition group"
            >
              <div className="text-xs text-myot-accent font-bold mb-1">
                #{i + 1} {rec.name}
              </div>
              <div className="text-xs opacity-70 mb-2">{rec.description}</div>
              <div className="flex flex-wrap gap-1">
                {rec.widgets.slice(0, 4).map((w) => (
                  <span key={w.id} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">
                    {w.label ?? w.root?.primitive ?? w.id}
                  </span>
                ))}
                {rec.widgets.length > 4 && (
                  <span className="text-[10px] opacity-50">+{rec.widgets.length - 4}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
