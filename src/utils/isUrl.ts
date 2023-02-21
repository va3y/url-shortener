export function isUrl(input: string) {
  try {
    new URL(input);
    return true;
  } catch (error) {
    return false;
  }
}
