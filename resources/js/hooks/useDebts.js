import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * @typedef {Object} Debt
 * @property {number} id
 * @property {string} description
 * @property {string} [creditor]
 * @property {number|string} amount
 * @property {number|string} [original_amount]
 * @property {boolean|number} [is_negotiated]
 * @property {number|string} [interest_rate]
 * @property {string} date
 * @property {string} status - 'Paid' | 'Pending'
 * @property {string} [observations]
 * @property {number} [installment_number]
 * @property {number} [total_installments]
 * @property {number} [total_savings] - Calculated by backend
 */

/**
 * Hook to manage debts state and operations.
 * 
 * @param {Object} options
 * @param {Function} options.showToast
 * @returns {Object}
 */
export default function useDebts({ showToast }) {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState('default');

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/debts?strategy=${strategy}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDebts(data);
      }
    } catch (error) {
      console.error('Falha ao buscar dívidas:', error);
      if (showToast) showToast('Erro ao carregar dívidas', 'error');
    } finally {
      setLoading(false);
    }
  }, [strategy, showToast]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const metrics = useMemo(() => {
    const pending = debts.filter(d => d.status === 'Pending');
    const paid = debts.filter(d => d.status === 'Paid');
    const totalPending = pending.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalPaid = paid.reduce((acc, curr) => acc + Number(curr.amount), 0);

    return {
      countPending: pending.length,
      countPaid: paid.length,
      totalPending,
      totalPaid
    };
  }, [debts]);

  /**
   * Total Savings: Sum of total_savings for negotiated debts.
   */
  const totalSavings = useMemo(() => {
    return debts
      .filter(d => Boolean(d.is_negotiated))
      .reduce((acc, curr) => acc + Number(curr.total_savings || 0), 0);
  }, [debts]);

  const handleToggleStatus = async (debt) => {
    const newStatus = debt.status === 'Pending' ? 'Paid' : 'Pending';
    try {
      const res = await fetch(`/api/debts/${debt.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        if (showToast) showToast(`Dívida marcada como ${newStatus === 'Paid' ? 'Paga' : 'Pendente'}`);
        fetchDebts();
      }
    } catch (error) {
      if (showToast) showToast('Erro ao atualizar status', 'error');
    }
  };

  const deleteDebt = async (debtId) => {
    try {
      const res = await fetch(`/api/debts/${debtId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        if (showToast) showToast('Dívida excluída com sucesso!');
        fetchDebts();
        return true;
      }
    } catch (error) {
      if (showToast) showToast('Erro ao excluir dívida', 'error');
    }
    return false;
  };

  return {
    debts,
    loading,
    strategy,
    setStrategy,
    fetchDebts,
    metrics,
    totalSavings,
    handleToggleStatus,
    deleteDebt
  };
}
