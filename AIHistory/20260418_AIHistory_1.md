# 📜 Myot Project History

## Current Task: Fix Gemini 503 Service Unavailable Error
- **Current Goal**: Gemini API의 503(High Demand) 에러 발생 시 안정적인 모델로 자동 폴백(Fallback) 처리
- **Completed Steps**: `api/gemini.ts`에 `gemini-2.5-flash` 호출 실패 시 `gemini-2.0-flash`로 재시도하는 예외 처리 추가 완료
- **Pending Steps**: 없음 (작업 완료)
- **Next Action**: 사용자의 다음 지시 대기