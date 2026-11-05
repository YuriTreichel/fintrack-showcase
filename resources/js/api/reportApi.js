import axios from 'axios';

const reportApi = {
    getBudgetReport: async () => {
        try {
            const response = await axios.get('/api/reports/budget', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching budget report:', error);
            throw error;
        }
    },
    getGoalsReport: async () => {
        try {
            const response = await axios.get('/api/reports/goals', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching goals report:', error);
            throw error;
        }
    }
};

export default reportApi;
