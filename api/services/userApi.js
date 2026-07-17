const USER_ENDPOINTS = require('../endpoints/userEndpoints');

/**
 * Business-level operations for the User API.
 * Wraps the ApiClient + endpoint definitions so tests never build
 * requests manually.
 */
class UserApi {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async listUsers(page = 1) {
    return this.apiClient.get(USER_ENDPOINTS.listUsers, { params: { page } });
  }

  async createUser(payload) {
    return this.apiClient.post(USER_ENDPOINTS.createUser, payload);
  }

  async getUser(id) {
    return this.apiClient.get(USER_ENDPOINTS.getUser(id));
  }

  async updateUser(id, payload) {
    return this.apiClient.put(USER_ENDPOINTS.updateUser(id), payload);
  }

  async patchUser(id, payload) {
    return this.apiClient.patch(USER_ENDPOINTS.updateUser(id), payload);
  }

  async deleteUser(id) {
    return this.apiClient.delete(USER_ENDPOINTS.deleteUser(id));
  }
}

module.exports = UserApi;
