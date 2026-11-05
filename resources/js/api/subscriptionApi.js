import axios from 'axios';

const subscriptionApi = {
  // Mudamos o nome do parâmetro para priceId para ficar mais claro
  createCheckoutSession: async (priceId) => { 
    try {
      // 1. Ajuste da Rota para bater exatamente com o Laravel
      const response = await axios.post('/api/checkout', {
        // 2. Ajuste da chave para plan (esperado pelo Controller)
        plan: priceId 
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  redirectToCheckout: async (priceId) => {
    try {
      const { url } = await subscriptionApi.createCheckoutSession(priceId);
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('URL da Stripe não retornada');
      }
      
      return { url };
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }
};

export default subscriptionApi;