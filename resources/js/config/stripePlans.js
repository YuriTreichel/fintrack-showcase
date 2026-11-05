// Stripe Price IDs - Configurados com os IDs reais do Stripe

const stripePlans = {
  // Plano Básico - R$ 9,90/mês
  BASIC_MONTHLY: import.meta.env.VITE_CASHIER_PRICE_BASIC_MONTHLY || 'basic_monthly',

  // Premium Mensal - R$ 19,90/mês
  PREMIUM_MONTHLY: import.meta.env.VITE_CASHIER_PRICE_PREMIUM_MONTHLY || 'premium_monthly',

  // Plano Anual - R$ 199,90/ano
  ANNUAL: import.meta.env.VITE_CASHIER_PRICE_PREMIUM_ANNUAL || 'annual',
};

export default stripePlans;
