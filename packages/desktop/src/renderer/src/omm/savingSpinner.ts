/**
 * Title-bar save spinner.
 *
 * Upstream shows a dirty dot but nothing while a write is in flight, so a save
 * of a large file reads as "nothing happened". The spinner replaces the dot
 * until the main process confirms or rejects the write.
 *
 * State lives on the editor store (`isSaving`) because the title bar binds to
 * it; only the timing lives here.
 */

/** A save is usually instantaneous. Hold the spinner briefly anyway, otherwise
 * it flickers and reads as a glitch rather than as confirmation. */
const MIN_SPINNER_MS = 600

let startedAt = 0

/** Anything with the reactive flag the title bar binds to. */
export interface SpinnerHost {
  isSaving: boolean
}

export const beginSaveSpinner = (host: SpinnerHost): void => {
  startedAt = Date.now()
  host.isSaving = true
}

/** Called on save confirmation *and* save failure, so the spinner can never
 * get stuck on. */
export const clearSaveSpinner = (host: SpinnerHost): void => {
  const remaining = Math.max(0, MIN_SPINNER_MS - (Date.now() - startedAt))
  setTimeout(() => {
    host.isSaving = false
  }, remaining)
}
