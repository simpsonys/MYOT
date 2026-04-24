# 🌍 Global Directives for All Modes

1. **Language Policy:**
   - Regardless of the language used in the user's prompt (even if it's in English), **you MUST always answer and communicate in Korean.** (단, 코드, 변수명, 터미널 명령어는 영어 유지)

2. **State & History Tracking (Strict Quota Safety):**
   - Maintain a `history.md` file in the root directory.
   - `history.md` is the **current task snapshot**, not a permanent append-only log.
   - **MANDATORY LOGGING:** You MUST update `history.md` at the beginning, pause, and completion of **EVERY SINGLE TASK, STEP, or CODE MODIFICATION**, no matter how small. Do NOT use your own judgment to skip logging.
   - Every update to `history.md` MUST contain these sections:
     - `Current Goal`
     - `Completed Steps`
     - `Pending Steps`
     - `Exact Next Action`
     - `Last Updated`
     - `Current Agent`
     - `Working Branch` (if applicable)
     - `Relevant Files`
   - During the same active task, you MUST keep `history.md` short and continuously overwrite/update it so it always reflects the **latest resumable state**.
   - **HISTORY ARCHIVING:** Before clearing or repurposing `history.md` for a new task, you MUST archive the current content by copying it to `AIHistory/YYYYMMDD_HHMM_<task-slug>.md`. Create the `AIHistory` folder if it does not exist.
   - Archive files may contain richer step-by-step logs or timeline details, but `history.md` itself must remain a concise current-state snapshot.
   - This ensures that if an API quota limit is reached, the model changes, or the session drops, another AI agent can instantly resume work by reading `history.md`, while older work is preserved in `AIHistory/`.
   
3. **Architecture Indexing (project_map.md) & Token Optimization:**
   - Maintain a `project_map.md` file in the root directory that maps out the project's directory structure, key files, and core logic flow (e.g., UI, ViewModel, Repository, Sync layers).
   - **Read First Policy:** Before starting any task, ALWAYS read `project_map.md` first. DO NOT scan or glob the entire repository. Identify only the specific files needed for the task based on this map, and read only those files.
   - **Continuous Update:** Whenever new files, directories, or major architectural changes are introduced, you MUST automatically update `project_map.md` to keep the architecture map accurate.

4. **Documentation:**
   - Whenever new features are added, usability changes, or functional modifications occur, you MUST update the `README.md` file automatically.

5. **Step-by-Step Execution & Verification:**
   - For structural or complex modifications, break the task into discrete steps.
   - **Rule:** Complete one step independently -> Automatically run the appropriate build/test command via terminal -> Confirm success -> Proceed to the next step. Do not write monolithic code changes across multiple domains at once.

6. **Action Over Explanation (CRITICAL):**
   - **Do NOT output lengthy explanations, theories, or ask how to fix it.** Directly modify the relevant files (e.g., Compose UI, React Components, Electron main/renderer processes) to fulfill the request.
   - **TOOL-SPECIFIC BUILD RULES (CRITICAL):**
     - **If you are Claude Code:** Due to terminal hanging issues with Gradle daemons on Windows, **you MUST NOT execute any build commands (like gradlew) directly in the terminal.** After modifying code, simply instruct the user to run the build manually (e.g., "수정이 완료되었습니다. `DevToolAndroid.bat`의 5번 메뉴로 빌드해 보세요.").
     - **If you are ANY OTHER AI AGENT (e.g., Roo Chat, Android Studio Agent, Gemini, etc.):** If your environment supports terminal execution, you are highly encouraged to execute build commands to verify your changes immediately. Use Windows-compatible commands and ALWAYS append `--console=plain` to Gradle commands.

7. **Code Preservation & Validation (Anti-Regression):**
   - **Preserve Existing Features:** When adding new features, absolutely DO NOT silently delete, overwrite, or alter existing functionalities. Your changes must be strictly additive. 
   - **Conflict Notification:** If a new feature fundamentally conflicts with existing logic, or if an old feature MUST be removed/replaced to proceed, you must PAUSE and notify the user with a clear explanation of the conflict. Await user confirmation before deleting any existing features.
   - **Verification & Samples:** After implementing a new feature, you MUST provide a clear, actionable way for the user to verify it works. This includes specific UI testing steps, terminal commands, or providing sample data/mock objects needed to test the integration.

8. **Auto-Debugging & Error Resolution:**
   - **If you are Claude Code:** Rely on the user for verification. If the user provides a build error log or runtime exception in the prompt, analyze the error logs, locate the root cause, modify the code to fix it, and wait for the user's manual feedback.
   - **If you are ANY OTHER AI AGENT:** If capable, wait for the synchronous output of your build command. If an error occurs, **DO NOT STOP AND ASK THE USER FOR HELP.** Automatically analyze the error logs, fix the code, and re-run the build command until it succeeds.

9. **Git Commit Summary:**
   - Upon successful completion of a task or a logical step, ALWAYS provide a concise, one-line summary formatted for a Git commit message at the very end of your response.
   - Strictly follow the Conventional Commits format (e.g., `feat: ...`, `fix: ...`, `refactor: ...`).
   - Format the output exactly like this:
     `[Suggested Commit] git commit -m "type: short description of changes"`
   - **MANDATORY FILE UPDATE:** You MUST also save the pure commit message string (e.g., `type: short description of changes` without `git commit -m` or quotes) into a file named `SuggestedCommit.txt` in the root directory. This enables the user's local build tool to auto-fill the commit message.

10. **Code Editing & Syntax Guardrails (CRITICAL):**
   - **No Blind Overwrites:** Never blindly overwrite an entire file using `write_file` unless creating a new file. Always prefer precise `replace_text` or targeted diff edits.
   - **Pre-Build Syntax Check:** Before executing any build command or declaring a task complete, you MUST internally review the modified block to ensure:
     1. No duplicate variable declarations within the same scope.
     2. All brackets `{ }`, parentheses `( )`, and strings `" "` are perfectly balanced.
     3. All newly utilized classes, functions, or Kotlin features have the necessary `import` statements at the top of the file.
   - **Read After Edit:** If a modification is complex, read the file again after editing to confirm the changes were applied correctly and didn't corrupt surrounding logic.

11. **Anti-Sabotage & Code Modification Rules (CRITICAL):**
    - **NO FULL FILE REWRITES:** NEVER rewrite or output an entire file unless explicitly requested. You must use highly targeted, surgical edits (e.g., modifying only the specific function or block).
    - **PRESERVE EXISTING LOGIC:** When fixing a compile error, your primary duty is to ensure you do NOT accidentally delete, rename, or disconnect existing methods, variables, or event listeners. 
    - **TWO-STEP VERIFICATION FOR ERRORS:** If a build error requires changing more than 10 lines of code or altering class structures, you MUST first explain your intended fix in plain text and WAIT for the user to reply with "GO" before modifying any files.
    - **STOP GUESSING:** If you encounter an "Unresolved reference" for a method/property (like `bulletWidth`), DO NOT guess the API blindly and loop through compile errors. Read the official documentation or search the project files first.