import ShortUniqueId from "short-unique-id";

class AppUtils {
  private prefix: string = "process_";
  private uid = new ShortUniqueId({ length: 12 });

  generateUniqueProcessId(): string {
    return this.prefix + this.uid.rnd();
  }

  /**
   * Utility for applying terminal color styles to text.
   * @param text - The string to color.
   * @returns A string formatted with ANSI color codes.
   */
  colorText = {
    blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
    green: (text: string) => `\x1b[32m${text}\x1b[0m`,
    yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
    cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
    red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  };
}

export default new AppUtils();
