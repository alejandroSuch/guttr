import { useState, useCallback, useRef } from "react";
import { AppHeader } from "./components/AppHeader";
import { DropZone } from "./components/DropZone";
import { ErrorMessage } from "./components/ErrorMessage";
import { Reader } from "./components/Reader";
import { ResumePrompt } from "./components/ResumePrompt";
import { extractComic } from "./lib/extractor";
import { revokeAllBlobUrls } from "./lib/image";
import { useReadingProgress } from "./hooks/useReadingProgress";
import type {
  Page,
  ExtractionProgress,
  ReadingDirection,
  ScalingMode,
  ReadingSession,
} from "./types/comic";

type AppState =
  | "idle"
  | "extracting"
  | "resume-prompt"
  | "ready"
  | "error";

function App() {
  const [state, setState] = useState<AppState>("idle");
  const [pages, setPages] = useState<Page[]>([]);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialPage, setInitialPage] = useState(0);
  const [initialDirection, setInitialDirection] =
    useState<ReadingDirection>("ltr");
  const [initialScalingMode, setInitialScalingMode] =
    useState<ScalingMode>("fit-width");

  const fileRef = useRef<{ name: string; size: number } | null>(null);
  const savedSession = useRef<ReadingSession | null>(null);
  const { load, save } = useReadingProgress();

  const handleFile = useCallback(
    async (file: File) => {
      // Clean up previous comic
      revokeAllBlobUrls(pages.map((p) => p.blobUrl));

      setState("extracting");
      setProgress(null);
      setError(null);
      setPages([]);
      setInitialPage(0);
      setInitialDirection("ltr");
      fileRef.current = { name: file.name, size: file.size };

      try {
        const result = await extractComic(file, setProgress);
        setPages(result.pages);

        // Check for saved progress
        const session = await load(file.name, file.size);
        if (session && session.currentPage > 0) {
          savedSession.current = session;
          setState("resume-prompt");
        } else {
          setState("ready");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to open comic";
        setError(message);
        setState("error");
      }
    },
    [pages, load],
  );

  const handleResume = () => {
    if (savedSession.current) {
      setInitialPage(savedSession.current.currentPage);
      setInitialDirection(savedSession.current.readingDirection);
      setInitialScalingMode(savedSession.current.scalingMode ?? "fit-width");
    }
    savedSession.current = null;
    setState("ready");
  };

  const handleStartOver = () => {
    savedSession.current = null;
    setState("ready");
  };

  const handlePageChange = useCallback(
    (page: number) => {
      if (fileRef.current) {
        save(fileRef.current.name, fileRef.current.size, page, initialDirection, initialScalingMode);
      }
    },
    [save, initialDirection, initialScalingMode],
  );

  const handleDirectionChange = useCallback(
    (direction: ReadingDirection) => {
      setInitialDirection(direction);
      if (fileRef.current) {
        save(fileRef.current.name, fileRef.current.size, 0, direction, initialScalingMode);
      }
    },
    [save, initialScalingMode],
  );

  const handleScalingModeChange = useCallback(
    (mode: ScalingMode) => {
      setInitialScalingMode(mode);
      if (fileRef.current) {
        save(fileRef.current.name, fileRef.current.size, 0, initialDirection, mode);
      }
    },
    [save, initialDirection],
  );

  const handleDismissError = () => {
    setError(null);
    setState("idle");
  };

  if (state === "error" && error) {
    return (
      <div className="app">
        <AppHeader />
        <ErrorMessage message={error} onDismiss={handleDismissError} />
      </div>
    );
  }

  if (state === "resume-prompt" && savedSession.current) {
    return (
      <div className="app">
        <AppHeader />
        <ResumePrompt
          pageNumber={savedSession.current.currentPage + 1}
          onResume={handleResume}
          onStartOver={handleStartOver}
        />
      </div>
    );
  }

  if (state === "ready" && pages.length > 0) {
    return (
      <div className="app">
        <Reader
          pages={pages}
          initialPage={initialPage}
          initialDirection={initialDirection}
          initialScalingMode={initialScalingMode}
          onPageChange={handlePageChange}
          onDirectionChange={handleDirectionChange}
          onScalingModeChange={handleScalingModeChange}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <AppHeader />
      <DropZone
        onFile={handleFile}
        progress={progress}
        isExtracting={state === "extracting"}
      />
    </div>
  );
}

export default App;
