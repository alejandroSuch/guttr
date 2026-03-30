interface ResumePromptProps {
  pageNumber: number;
  onResume: () => void;
  onStartOver: () => void;
}

export function ResumePrompt({
  pageNumber,
  onResume,
  onStartOver,
}: ResumePromptProps) {
  return (
    <div className="resume-prompt">
      <p>You were on page {pageNumber}. Resume reading?</p>
      <div className="resume-prompt__actions">
        <button onClick={onResume}>Resume</button>
        <button onClick={onStartOver}>Start Over</button>
      </div>
    </div>
  );
}
