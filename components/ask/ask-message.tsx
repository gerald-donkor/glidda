import type { AskMessage as AskMessageData } from "@/lib/ask/types"
import { shell } from "@/lib/copy/shell"
import { cn } from "@/lib/utils"

/**
 * One row in the Ask bar's thread (§8.1, prompt 15).
 *
 * Presentational, and no `"use client"`: it holds no state and no handler, so it renders inside
 * whichever boundary its parent already established.
 *
 * Alignment and fill are the only visual cues for who is speaking, and neither survives a screen
 * reader — hence the visually-hidden speaker prefix (§12). An error row uses the assistant slot
 * with muted text and **no colour and no icon**: §6.1 has no error colour and this component does
 * not invent one. The distinction is carried by the wording, which §11 requires to be specific.
 */
export function AskMessage({ message }: { message: AskMessageData }) {
  const visitor = message.role === "visitor"

  return (
    <div className={cn("flex", visitor ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "rounded-card px-4 py-2.5 whitespace-pre-wrap",
          visitor && "max-w-[85%] bg-surface text-body text-ink",
          !visitor && "hairline w-full bg-paper",
          !visitor && (message.error ? "text-small text-rail-muted" : "text-body text-ink")
        )}
      >
        <span className="sr-only">
          {visitor ? shell.askVisitorPrefix : shell.askAssistantPrefix}:{" "}
        </span>
        {message.text}
      </div>
    </div>
  )
}
