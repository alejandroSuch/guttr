interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="error-message">
      <p>{message}</p>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  );
}
