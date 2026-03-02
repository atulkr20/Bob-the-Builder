export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const colors = {
  primary: "#f97316",
  secondary: "#eab308",
  accent: "#84cc16",
  background: "#080808",
};

export const gradients = {
  primary: "linear-gradient(135deg, #f97316, #eab308)",
  full: "linear-gradient(90deg, #f97316 0%, #eab308 50%, #84cc16 100%)",
};
