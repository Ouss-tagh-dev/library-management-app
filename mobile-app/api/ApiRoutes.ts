const BASE_URL = "http://192.168.224.33:8000/api/v1";

export const ApiRoutes = {
  login: () => `${BASE_URL}/auth/signin`,
  register: () => `${BASE_URL}/auth/signup`,
  profile: () => `${BASE_URL}/user/profile`,
  books: () => `${BASE_URL}/book`,
  book: (id: number) => `${BASE_URL}/book/${id}`,
  loan: () => `${BASE_URL}/loan`,
  deleteLoan: (id: number) => `${BASE_URL}/loan/${id}`,
};
