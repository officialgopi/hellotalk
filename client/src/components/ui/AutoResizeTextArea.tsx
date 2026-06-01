import { cn } from "@/lib/cn";
import { useEffect, useRef } from "react";

interface AutoResizeTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void; // Included to match Chat footer implementations safely
}

const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  onChange,
  placeholder = "Type Message Here...",
  className,
  onKeyDown,
}: AutoResizeTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 1. Reset height to shrink correctly when text is deleted
      textarea.style.height = "auto";

      // 2. Compute dynamic heights (matching 24px line-height perfectly)
      const lineHeight = 24;
      const maxRows = 5; // Clean premium SaaS expansion threshold before scroll triggers
      const maxHeight = maxRows * lineHeight;

      const currentScrollHeight = textarea.scrollHeight;

      // 3. Set the calculated height boundary
      textarea.style.height = `${Math.min(currentScrollHeight, maxHeight)}px`;

      // 4. Clean UX: Only reveal vertical scrollbars when the threshold is exceeded
      if (currentScrollHeight > maxHeight) {
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.overflowY = "hidden";
      }
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full bg-transparent outline-none resize-none text-[13px] sm:text-sm leading-6 text-neutral-900 dark:text-[#ececec] placeholder-neutral-400 dark:placeholder-neutral-500 transition-colors py-1 scrollbar-none",
        className,
      )}
      rows={1}
    />
  );
};

export default AutoResizeTextarea;
