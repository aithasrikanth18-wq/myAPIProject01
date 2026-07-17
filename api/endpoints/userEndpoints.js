/**
 * Centralized user API endpoint definitions.
 * Tests and services must always reference these instead of hardcoding URLs.
 */
// Paths are relative (no leading slash) so they append to the configured
// baseUrl instead of overriding its path.
module.exports = {
  listUsers: 'users',
  createUser: 'users/add',
  getUser: (id) => `users/${id}`,
  updateUser: (id) => `users/${id}`,
  deleteUser: (id) => `users/${id}`,
};
