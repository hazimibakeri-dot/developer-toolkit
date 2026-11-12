/** Outcome of a conversion that can fail with a user-facing message. */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const fail = <T = never>(error: string): Result<T> => ({ ok: false, error });
