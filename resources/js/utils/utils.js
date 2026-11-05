import { parseISO, addMonths } from 'date-fns';

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const getAppUrl = (path = "") => {
  const isLocal = window.location.hostname.includes("localhost");
  const baseUrl = isLocal
    ? "http://app.localhost:8000"
    : "https://app.fintrackweb.com.br";
  return `${baseUrl}${path}`;
};

export const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    window.scrollTo({
      top: element.offsetTop - 80,
      behavior: "smooth",
    });
  }
};

/**
 * Calculates the effective date (accounting month) for a transaction.
 * For credit card expenses, it uses the closing/due day logic.
 */
export const getTransactionEffectiveDate = (t, cards) => {
  if (!t.card_id || !cards?.length || t.type !== 'Expense' || t.is_effective) return parseISO(t.date);
  
  const card = cards.find(c => String(c.id) === String(t.card_id));
  if (!card || !card.closing_day || !card.due_day) return parseISO(t.date);

  const tDate = parseISO(t.date);
  let closingMonth = tDate.getMonth();
  let closingYear = tDate.getFullYear();

  // If purchase day is >= closing day, it goes to the next invoice cycle
  if (tDate.getDate() >= card.closing_day) {
    closingMonth++;
    if (closingMonth > 11) {
      closingMonth = 0;
      closingYear++;
    }
  }

  let dueMonth = closingMonth;
  let dueYear = closingYear;

  // If due day < closing day, it means the due date is in the month AFTER the closing month
  if (card.due_day < card.closing_day) {
    dueMonth++;
    if (dueMonth > 11) {
      dueMonth = 0;
      dueYear++;
    }
  }

  return new Date(dueYear, dueMonth, card.due_day);
};
