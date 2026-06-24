const API_BASE = "/api";

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint),
  post: <T = any>(endpoint: string, body?: any) => request<T>(endpoint, { method: "POST", body }),
  put: <T = any>(endpoint: string, body?: any) => request<T>(endpoint, { method: "PUT", body }),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),

  auth: {
    register: (data: { name: string; email: string; password: string; phone?: string }) =>
      request("/auth/register", { method: "POST", body: data }),
    login: (data: { email: string; password: string }) =>
      request("/auth/login", { method: "POST", body: data }),
    firebaseLogin: (data: { firebaseUid: string; name: string; email: string }) =>
      request("/auth/firebase-login", { method: "POST", body: data }),
    getMe: () => request("/auth/me"),
    updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
      request("/auth/profile", { method: "PUT", body: data }),
  },

  menu: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return request(`/menu${query}`);
    },
    getById: (id: number) => request(`/menu/${id}`),
    getCategories: () => request("/menu/categories"),
    getTags: () => request("/menu/tags"),
    create: (data: any) => request("/menu", { method: "POST", body: data }),
    update: (id: number, data: any) => request(`/menu/${id}`, { method: "PUT", body: data }),
    delete: (id: number) => request(`/menu/${id}`, { method: "DELETE" }),
  },

  orders: {
    create: (data: any) => request("/orders", { method: "POST", body: data }),
    getAll: () => request("/orders"),
    getById: (id: number) => request(`/orders/${id}`),
    updateStatus: (id: number, status: string) =>
      request(`/orders/${id}/status`, { method: "PUT", body: { status } }),
    assignRider: (id: number, riderId: number) =>
      request(`/orders/${id}/assign-rider`, { method: "PUT", body: { riderId } }),
    receive: (id: number) => request(`/orders/${id}/receive`, { method: "PUT" }),
    getMyOrders: () => request("/orders/my-orders"),
  },

  admin: {
    getUsers: () => request("/admin/users"),
    updateUserRole: (id: number, role: string) =>
      request(`/admin/users/${id}/role`, { method: "PUT", body: { role } }),
    updateUserStatus: (id: number, isActive: boolean) =>
      request(`/admin/users/${id}/status`, { method: "PUT", body: { isActive } }),
    deleteUser: (id: number) => request(`/admin/users/${id}`, { method: "DELETE" }),
    getRiders: () => request("/admin/riders"),
    createRider: (data: any) => request("/admin/riders", { method: "POST", body: data }),
    updateRider: (id: number, data: any) => request(`/admin/riders/${id}`, { method: "PUT", body: data }),
    deleteRider: (id: number) => request(`/admin/riders/${id}`, { method: "DELETE" }),
    getCustomers: () => request("/admin/customers"),
    getCustomerOrders: (id: number) => request(`/admin/customers/${id}/orders`),
    getFeedback: () => request("/admin/feedback"),
    deleteFeedback: (id: number) => request(`/admin/feedback/${id}`, { method: "DELETE" }),
    getSetting: (key: string) => request(`/admin/settings/${key}`),
    updateSetting: (key: string, value: string) =>
      request(`/admin/settings/${key}`, { method: "PUT", body: { value } }),
  },

  rider: {
    getAssignedOrders: () => request("/rider/assigned-orders"),
    acceptOrder: (id: number) => request(`/rider/orders/${id}/accept`, { method: "PUT" }),
    pickedUp: (id: number) => request(`/rider/orders/${id}/picked-up`, { method: "PUT" }),
    deliver: (id: number) => request(`/rider/orders/${id}/deliver`, { method: "PUT" }),
    getHistory: () => request("/rider/delivery-history"),
    updateAvailability: (isAvailable: boolean) =>
      request("/rider/availability", { method: "PUT", body: { isAvailable } }),
  },

  feedback: {
    create: (data: { orderId?: number; rating: number; comment: string }) =>
      request("/feedback", { method: "POST", body: data }),
    getAll: () => request("/feedback"),
    delete: (id: number) => request(`/feedback/${id}`, { method: "DELETE" }),
  },

  messages: {
    createChat: (subject: string) =>
      request("/messages/chats", { method: "POST", body: { subject } }),
    getChats: () => request("/messages/chats"),
    sendMessage: (chatId: string, content: string, messageType?: string) =>
      request(`/messages/chats/${chatId}/messages`, {
        method: "POST",
        body: { content, messageType: messageType || "text" },
      }),
    getMessages: (chatId: string) => request(`/messages/chats/${chatId}/messages`),
    markRead: (id: number) => request(`/messages/${id}/read`, { method: "PUT" }),
  },

  notifications: {
    getAll: () => request("/notifications"),
    markRead: (id: number) => request(`/notifications/${id}/read`, { method: "PUT" }),
    markAllRead: () => request("/notifications/read-all", { method: "PUT" }),
  },

  upload: {
    image: async (base64: string, fileName: string): Promise<{ url: string; fileId: string }> => {
      return request("/upload/upload", { method: "POST", body: { base64, fileName } });
    },
  },
};
