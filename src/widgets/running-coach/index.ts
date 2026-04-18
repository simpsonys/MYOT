import type { WidgetDefinition } from '../../types';
import RunningCoachWidget, {
  type RunningCoachConfig,
  type RouteSuggestion,
} from './RunningCoach';

// Mock route suggestion pool — in production this would come from maps API.
const ROUTE_POOL: RouteSuggestion[] = [
  { name: '한강뷰 코스', vibe: '벚꽃 시즌 최적, 강바람과 함께', extraKm: 1, extraKcal: 120 },
  { name: '카페 투어 코스', vibe: '유명 커피숍 3곳 경유', extraKm: 1, extraKcal: 95 },
  {
    name: '피톤치드 코스',
    vibe: '숲길, 새소리',
    extraKm: 1,
    extraKcal: 180,
    caution: '오르막 구간 있음, 심박수 체크 추천',
  },
  { name: '야경 코스', vibe: '도시 야경 + 다리 건너기', extraKm: 1.5, extraKcal: 160 },
  {
    name: '바다 냄새 코스',
    vibe: '해변 산책로 왕복',
    extraKm: 2,
    extraKcal: 220,
    caution: '해풍 강하면 페이스 떨어질 수 있어요',
  },
];

function pickThreeRoutes(extraKm: number): RouteSuggestion[] {
  return ROUTE_POOL.slice(0, 3).map((r) => ({
    ...r,
    extraKm,
    extraKcal: Math.round(r.extraKcal * extraKm),
  }));
}

const definition: WidgetDefinition<RunningCoachConfig> = {
  type: 'running-coach',
  name: '러닝 코치',
  description:
    'A Living Widget that shows today\'s run stats and converses with the user about future runs. Reacts to emotional utterances ("가뿐한데", "힘들어") by suggesting longer routes or recovery. This is the differentiation showcase — treat emotion as input, not just numbers.',
  icon: '🏃',

  defaultSize: { w: 4, h: 5 },
  minSize: { w: 3, h: 3 },

  configSchema: {
    distanceKm: 'Today\'s distance in km',
    durationMin: 'Today\'s duration in minutes',
    avgPaceMinKm: 'Average pace, min/km (decimal, e.g. 5.5 = 5:30)',
    commentary: 'Coach\'s current verbal comment to the user',
    suggestions: 'Array of route suggestions currently shown, or null',
    recoveryMode: 'boolean — coach is recommending rest',
  },
  defaultConfig: {
    distanceKm: 5.2,
    durationMin: 28,
    avgPaceMinKm: 5.4,
    commentary: '오늘 5.2km 완주! 어제보다 +0.3km 이에요 🎉',
    suggestions: null,
    recoveryMode: false,
  },

  component: RunningCoachWidget,

  utterances: [
    {
      user: '오늘 러닝 경로 보여줘',
      intent: 'create',
      aiMessage: '오늘의 러닝 기록을 가져왔어요',
    },
    {
      user: '이 정도면 가뿐한데 더 늘려도 되겠어',
      intent: 'invoke_action',
      when: 'running-coach is on screen',
      action: 'suggestLongerRoute',
      actionParams: { increaseKm: 1 },
      aiMessage: '오 대단하시네요! 그럼 1km만 늘려 볼까요?',
    },
    {
      user: '2km 더 뛰어볼까',
      intent: 'invoke_action',
      action: 'suggestLongerRoute',
      actionParams: { increaseKm: 2 },
      aiMessage: '2km 연장 코스 몇 개 뽑아봤어요!',
    },
    {
      user: '오늘 무리했어, 힘들어',
      intent: 'invoke_action',
      action: 'recommendRecovery',
      aiMessage: '오늘은 푹 쉬시는 게 좋겠어요. 내일 더 잘 달릴 수 있도록 💙',
    },
    {
      user: '첫번째 코스로 갈래',
      intent: 'invoke_action',
      when: 'suggestions are currently shown',
      action: 'pickRoute',
      actionParams: { index: 0 },
      aiMessage: '좋아요! 내일 그 코스로 함께 뛰어요',
    },
  ],

  actions: {
    suggestLongerRoute: {
      description: 'Generate 3 alternative longer routes, show as suggestion cards',
      params: { increaseKm: 'number — km to add' },
      handler: (ctx, params) => {
        const increase = Number(params?.increaseKm ?? 1);
        const suggestions = pickThreeRoutes(increase);
        ctx.updateConfig({
          suggestions,
          commentary: `${increase}km 추가 코스 3개를 추천해요. 어떤 게 끌리세요?`,
          recoveryMode: false,
        });
        ctx.emit({
          type: 'running.routesSuggested',
          source: ctx.widgetId,
          payload: { count: suggestions.length, extraKm: increase },
        });
        return { ok: true };
      },
    },
    recommendRecovery: {
      description: 'Switch coach into recovery mode — recommend rest, emit event',
      handler: (ctx) => {
        ctx.updateConfig({
          recoveryMode: true,
          suggestions: null,
          commentary: '오늘은 스트레칭과 휴식을 추천해요. 근육 회복이 다음 달리기의 실력이에요.',
        });
        ctx.emit({
          type: 'running.recoveryRecommended',
          source: ctx.widgetId,
        });
        return { ok: true };
      },
    },
    pickRoute: {
      description: 'User picked a suggested route. Confirm and clear suggestions.',
      params: { index: 'integer — which suggestion index (0, 1, 2)' },
      handler: (ctx, params) => {
        const idx = Number(params?.index ?? 0);
        const config = ctx.currentConfig as RunningCoachConfig;
        const picked = config.suggestions?.[idx];
        if (!picked) return { ok: false, error: 'No suggestion at that index' };
        ctx.updateConfig({
          suggestions: null,
          commentary: `좋아요! "${picked.name}" 으로 내일 달려봐요 (+${picked.extraKm}km)`,
        });
        ctx.emit({
          type: 'running.routePicked',
          source: ctx.widgetId,
          payload: picked,
        });
        return { ok: true };
      },
    },
  },

  collaboratesWith: [
    {
      withType: 'weather',
      when: 'weather condition is rain or snow',
      behavior: 'Show indoor treadmill hint instead of outdoor routes',
    },
    {
      withType: 'health',
      when: 'heart rate averaged above 160bpm yesterday',
      behavior: 'Default to recovery mode when user asks about running',
    },
  ],

  listensFor: ['weather.changed', 'health.alert'],
};

export default definition;
