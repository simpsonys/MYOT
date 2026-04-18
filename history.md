# 📜 Myot Project History

## Current Task: Fix DevTools.bat Variable Retention Bug
- **Current Goal**: `DevTools.bat` 배포(Option 6) 재실행 시 이전 입력값이 남아있는 버그(태그명 꼬임) 수정
- **Completed Steps**: `USER_VERSION` 및 `TAG_NAME` 입력 프롬프트 전에 변수를 명시적으로 초기화(`set "VAR="`)하도록 수정 완료
- **Pending Steps**: 없음 (작업 완료)
- **Next Action**: 사용자의 다음 지시 대기