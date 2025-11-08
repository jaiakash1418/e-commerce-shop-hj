import apiClient from '/js/api-client.js'; // Corrected path

class AdminUI {
    constructor() {
        this.apiClient = apiClient;
    }

    async fetchUsers() {
        try {
            const response = await this.apiClient.get('/users');
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    async updateUser(id, data) {
        try {
            const response = await this.apiClient.put(`/users/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
}

export default AdminUI;