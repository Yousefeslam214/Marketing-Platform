export function getErrorMessage(err: unknown): string {
  if (!err) return "An unexpected error occurred";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "An unexpected error occurred";
  }
}
