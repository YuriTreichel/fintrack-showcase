import { useState, useCallback } from 'react';
import reportApi from '../api/reportApi';
import { useFinStore } from '../store/useFinStore';

export const usePremiumReports = () => {
    const [loadingBudgets, setLoadingBudgets] = useState(false);
    const [loadingGoals, setLoadingGoals] = useState(false);
    const [error, setError] = useState(null);
    const [budgetData, setBudgetData] = useState([]);
    const [goalsData, setGoalsData] = useState([]);
    
    const { userPlan } = useFinStore();

    const fetchBudgetsReport = useCallback(async () => {
        // Se o plano não for premium, não tentamos buscar (o backend também bloquearia)
        if (userPlan !== 'premium') return;
        
        setLoadingBudgets(true);
        setError(null);
        try {
            const data = await reportApi.getBudgetReport();
            setBudgetData(data);
        } catch (err) {
            console.error('Error in usePremiumReports (budgets):', err);
            
            // Trata erro 403 (Usuário perdeu status Premium ou tentou acessar sem permissão)
            if (err.response?.status === 403) {
                window.dispatchEvent(new CustomEvent('requireUpgrade', { 
                    detail: 'Os Relatórios Avançados são exclusivos do Plano Premium.' 
                }));
            }
            
            setError(err.response?.data?.message || 'Erro ao carregar relatório de planejamentos');
        } finally {
            setLoadingBudgets(false);
        }
    }, [userPlan]);

    const fetchGoalsReport = useCallback(async () => {
        if (userPlan !== 'premium') return;
        
        setLoadingGoals(true);
        setError(null);
        try {
            const data = await reportApi.getGoalsReport();
            setGoalsData(data);
        } catch (err) {
            console.error('Error in usePremiumReports (goals):', err);
            
            if (err.response?.status === 403) {
                window.dispatchEvent(new CustomEvent('requireUpgrade', { 
                    detail: 'Os Relatórios Avançados são exclusivos do Plano Premium.' 
                }));
            }
            
            setError(err.response?.data?.message || 'Erro ao carregar relatório de metas');
        } finally {
            setLoadingGoals(false);
        }
    }, [userPlan]);

    return {
        loading: loadingBudgets || loadingGoals,
        loadingBudgets,
        loadingGoals,
        error,
        budgetData,
        goalsData,
        fetchBudgetsReport,
        fetchGoalsReport
    };
};
