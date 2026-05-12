export function formatDate(value, options = {}) {
  if (!value) {
    return "-";
  }

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...options,
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatMonthRange(startDate, endDate, isCurrent = false) {
  if (!startDate && !endDate) {
    return "Période à définir";
  }

  const start = startDate
    ? formatDate(startDate, {
        day: undefined,
        month: "long",
        year: "numeric",
      })
    : "Début à définir";

  const end = isCurrent
    ? "Aujourd'hui"
    : endDate
      ? formatDate(endDate, {
          day: undefined,
          month: "long",
          year: "numeric",
        })
      : "Présent";

  return `${start} - ${end}`;
}

export function formatListLabel(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }

  return value || "-";
}

export function truncate(value, max = 140) {
  if (!value) {
    return "";
  }

  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
