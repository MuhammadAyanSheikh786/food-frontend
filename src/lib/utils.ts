export function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `Rs. ${num.toLocaleString()}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    preparing: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    ready: "bg-green-500/20 text-green-400 border-green-500/30",
    assigned: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    picked_up: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    delivered: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    received: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[status] || "bg-dark-600/50 text-dark-300 border-dark-500/30";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready",
    assigned: "Assigned",
    picked_up: "Picked Up",
    delivered: "Awaiting Confirmation",
    received: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "...";
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80";
  return path;
}

export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
    const offset = 80;
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}
