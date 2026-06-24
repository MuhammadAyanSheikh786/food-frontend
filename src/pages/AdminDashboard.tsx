import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { formatPrice, getStatusColor, getStatusLabel, getImageUrl } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiPackage, FiUsers, FiTruck, FiStar, FiSettings, FiLogOut,
  FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiSearch,
  FiMessageSquare, FiBell, FiHome, FiMenu, FiChevronDown,
  FiFolder, FiTag, FiDollarSign, FiShoppingBag, FiUpload,
  FiImage,
} from "react-icons/fi";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string | null;
  categoryName?: string;
  tagName?: string;
  categoryId?: number;
  tagId?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isExclusive: boolean;
  isFamilyDeal: boolean;
  isNewItem: boolean;
}

interface Order {
  id: number;
  orderNumber?: string;
  customerName?: string;
  customerId?: number;
  items?: { name: string; quantity: number; price: number }[] | string;
  totalAmount: number;
  status: string;
  createdAt: string;
  riderId?: number | null;
  riderName?: string;
}

interface Rider {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isAvailable: boolean;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  orderCount?: number;
}

interface Feedback {
  id: number;
  customerName?: string;
  customerEmail?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Chat {
  id: string;
  chatId: string;
  subject: string;
  customerName?: string;
  customerEmail?: string;
  lastMessage?: string;
  unreadCount?: number;
  createdAt: string;
}

interface Message {
  id: number;
  content: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

const statuses = ["pending", "confirmed", "preparing", "ready", "assigned", "picked_up", "delivered", "received", "cancelled"];

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: FiHome },
  { key: "menu", label: "Menu Management", icon: FiPackage },
  { key: "orders", label: "Orders", icon: FiShoppingBag },
  { key: "riders", label: "Riders", icon: FiTruck },
  { key: "customers", label: "Customers", icon: FiUsers },
  { key: "feedback", label: "Feedback", icon: FiStar },
  { key: "messages", label: "Messages", icon: FiMessageSquare },
  { key: "settings", label: "Settings", icon: FiSettings },
];

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, activeCustomers: 0, availableRiders: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [settingKey, setSettingKey] = useState("");
  const [settingValue, setSettingValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [menuForm, setMenuForm] = useState<Partial<MenuItem> & { categoryId?: number; tagId?: number }>({});
  const [menuFormOpen, setMenuFormOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [riderForm, setRiderForm] = useState<Partial<Rider>>({});
  const [riderFormOpen, setRiderFormOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);

  const [assignRiderOrder, setAssignRiderOrder] = useState<Order | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<number | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: number } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      switch (activeTab) {
        case "dashboard":
          await fetchDashboardData();
          break;
        case "menu":
          await Promise.all([fetchMenuItems(), fetchCategories(), fetchTags()]);
          break;
        case "orders":
          await Promise.all([fetchOrders(), fetchRiders()]);
          break;
        case "riders":
          await fetchRiders();
          break;
        case "customers":
          await fetchCustomers();
          break;
        case "feedback":
          await fetchFeedback();
          break;
        case "messages":
          await fetchChats();
          break;
        case "settings":
          await fetchSettings();
          break;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDashboardData() {
    const [allOrders, allRiders, allCustomers] = await Promise.all([
      api.orders.getAll(),
      api.admin.getRiders(),
      api.admin.getCustomers(),
    ]);
    const ordersList = allOrders as Order[];
    const completed = ordersList.filter((o) => o.status === "received");
    const revenue = completed.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    setStats({
      totalOrders: ordersList.length,
      totalRevenue: revenue,
      activeCustomers: (allCustomers as Customer[]).length,
      availableRiders: (allRiders as Rider[]).filter((r) => r.isAvailable).length,
    });
    setRecentOrders(ordersList.slice(0, 10));
    setRiders(allRiders as Rider[]);
  }

  async function fetchMenuItems() {
    const data = await api.menu.getAll();
    setMenuItems((data as any).items || data as MenuItem[]);
  }

  async function fetchCategories() {
    try {
      const data = await api.menu.getCategories();
      setCategories(data as Category[]);
    } catch {
      setCategories([]);
    }
  }

  async function fetchTags() {
    try {
      const data = await api.menu.getTags();
      setTags(data as Tag[]);
    } catch {
      setTags([]);
    }
  }

  async function fetchOrders() {
    const data = await api.orders.getAll();
    setOrders(data as Order[]);
  }

  async function fetchRiders() {
    const data = await api.admin.getRiders();
    setRiders(data as Rider[]);
  }

  async function fetchCustomers() {
    const data = await api.admin.getCustomers();
    setCustomers(data as Customer[]);
  }

  async function fetchFeedback() {
    const data = await api.admin.getFeedback();
    setFeedbacks(data as Feedback[]);
  }

  async function fetchChats() {
    const data = await api.messages.getChats();
    setChats(data as Chat[]);
  }

  async function fetchMessages(chatId: string) {
    try {
      const data = await api.messages.getMessages(chatId);
      setMessages(data as Message[]);
    } catch {
      setMessages([]);
    }
  }

  async function fetchSettings() {
    try {
      const dCharge = await api.admin.getSetting("delivery_charge");
      setDeliveryCharge(String(dCharge?.value ?? ""));
    } catch {
      setDeliveryCharge("");
    }
  }

  async function fetchCustomerOrders(customerId: number) {
    try {
      const data = await api.admin.getCustomerOrders(customerId);
      setCustomerOrders(data as Order[]);
    } catch {
      setCustomerOrders([]);
    }
  }

  async function handleLogout() {
    logout();
    navigate("/login");
  }

  async function handleCreateMenuItem() {
    try {
      const payload: any = { ...menuForm };
      if (payload.categoryId) payload.categoryId = Number(payload.categoryId);
      if (payload.tagId) payload.tagId = Number(payload.tagId);
      if (typeof payload.price === "string") payload.price = parseFloat(payload.price);
      payload.isAvailable = payload.isAvailable ?? true;
      payload.isFeatured = payload.isFeatured ?? false;
      payload.isExclusive = payload.isExclusive ?? false;
      payload.isFamilyDeal = payload.isFamilyDeal ?? false;
      payload.isNewItem = payload.isNewItem ?? false;
      await api.menu.create(payload);
      toast.success("Menu item created");
      setMenuFormOpen(false);
      setMenuForm({});
      fetchMenuItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to create menu item");
    }
  }

  async function handleUpdateMenuItem() {
    if (!editingMenuItem) return;
    try {
      const payload: any = { ...menuForm };
      if (payload.categoryId) payload.categoryId = Number(payload.categoryId);
      if (payload.tagId) payload.tagId = Number(payload.tagId);
      if (typeof payload.price === "string") payload.price = parseFloat(payload.price);
      await api.menu.update(editingMenuItem.id, payload);
      toast.success("Menu item updated");
      setMenuFormOpen(false);
      setMenuForm({});
      setEditingMenuItem(null);
      fetchMenuItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to update menu item");
    }
  }

  async function handleDeleteMenuItem(id: number) {
    try {
      await api.menu.delete(id);
      toast.success("Menu item deleted");
      setConfirmDelete(null);
      fetchMenuItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete menu item");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const data = await api.upload.image(base64, file.name);
      setMenuForm({ ...menuForm, image: data.url });
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  function openCreateMenuForm() {
    setEditingMenuItem(null);
    setMenuForm({ isAvailable: true, isFeatured: false, isExclusive: false, isFamilyDeal: false, isNewItem: false });
    setMenuFormOpen(true);
  }

  function openEditMenuForm(item: MenuItem) {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      categoryId: item.categoryId,
      tagId: item.tagId,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      isExclusive: item.isExclusive,
      isFamilyDeal: item.isFamilyDeal,
      isNewItem: item.isNewItem,
    });
    setMenuFormOpen(true);
  }

  async function handleToggleAvailability(item: MenuItem) {
    try {
      await api.menu.update(item.id, { isAvailable: !item.isAvailable });
      toast.success(`Item ${item.isAvailable ? "sold out" : "available"}`);
      fetchMenuItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to update availability");
    }
  }

  async function handleUpdateOrderStatus(orderId: number, status: string) {
    try {
      await api.orders.updateStatus(orderId, status);
      toast.success("Order status updated");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status");
    }
  }

  async function handleAssignRider() {
    if (!assignRiderOrder || !selectedRiderId) return;
    try {
      await api.orders.assignRider(assignRiderOrder.id, selectedRiderId);
      toast.success("Rider assigned to order");
      setAssignRiderOrder(null);
      setSelectedRiderId(null);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to assign rider");
    }
  }

  async function handleCreateRider() {
    try {
      await api.admin.createRider(riderForm);
      toast.success("Rider created");
      setRiderFormOpen(false);
      setRiderForm({});
      fetchRiders();
    } catch (err: any) {
      toast.error(err.message || "Failed to create rider");
    }
  }

  async function handleUpdateRider() {
    if (!editingRider) return;
    try {
      await api.admin.updateRider(editingRider.id, riderForm);
      toast.success("Rider updated");
      setRiderFormOpen(false);
      setRiderForm({});
      setEditingRider(null);
      fetchRiders();
    } catch (err: any) {
      toast.error(err.message || "Failed to update rider");
    }
  }

  async function handleToggleRiderAvailability(rider: Rider) {
    try {
      await api.admin.updateRider(rider.id, { isAvailable: !rider.isAvailable });
      toast.success(`Rider ${rider.isAvailable ? "unavailable" : "available"}`);
      fetchRiders();
    } catch (err: any) {
      toast.error(err.message || "Failed to update rider availability");
    }
  }

  async function handleDeleteRider(id: number) {
    try {
      await api.admin.deleteRider(id);
      toast.success("Rider deleted");
      setConfirmDelete(null);
      fetchRiders();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete rider");
    }
  }

  async function handleDeleteFeedback(id: number) {
    try {
      await api.admin.deleteFeedback(id);
      toast.success("Feedback deleted");
      setConfirmDelete(null);
      fetchFeedback();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete feedback");
    }
  }

  async function handleSendReply() {
    if (!selectedChat || !replyText.trim()) return;
    try {
      await api.messages.sendMessage(selectedChat.chatId, replyText);
      setReplyText("");
      fetchMessages(selectedChat.chatId);
      toast.success("Reply sent");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply");
    }
  }

  async function handleUpdateDeliveryCharge() {
    try {
      await api.admin.updateSetting("delivery_charge", deliveryCharge);
      toast.success("Delivery charge updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update delivery charge");
    }
  }

  async function handleUpdateSetting() {
    if (!settingKey.trim()) return;
    try {
      await api.admin.updateSetting(settingKey, settingValue);
      toast.success("Setting updated");
      setSettingsMap((prev) => ({ ...prev, [settingKey]: settingValue }));
      setSettingKey("");
      setSettingValue("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update setting");
    }
  }

  function openEditRiderForm(rider: Rider) {
    setEditingRider(rider);
    setRiderForm({ name: rider.name, email: rider.email, phone: rider.phone });
    setRiderFormOpen(true);
  }

  function handleSelectChat(chat: Chat) {
    setSelectedChat(chat);
    fetchMessages(chat.chatId);
  }

  function handleSelectCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer.id);
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-dark-500"}`} />
    ));
  }

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-dark-950">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-900/90 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold gradient-text">Iqbal Food</h1>
          <p className="text-xs text-dark-400 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === key
                  ? "bg-gradient-to-r from-primary-500/20 to-primary-600/10 text-primary-400 border border-primary-500/20"
                  : "text-dark-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-dark-900/50 backdrop-blur-xl border-b border-white/10 flex items-center px-4 lg:px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-dark-300 hover:text-white"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-white capitalize">
            {navItems.find((n) => n.key === activeTab)?.label || "Dashboard"}
          </h2>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-dark-400">{user?.name}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && renderDashboard()}
              {activeTab === "menu" && renderMenuManagement()}
              {activeTab === "orders" && renderOrders()}
              {activeTab === "riders" && renderRiders()}
              {activeTab === "customers" && renderCustomers()}
              {activeTab === "feedback" && renderFeedback()}
              {activeTab === "messages" && renderMessages()}
              {activeTab === "settings" && renderSettings()}
            </>
          )}
        </main>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel max-w-sm w-full mx-4 p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Confirm Delete</h3>
            <p className="text-dark-400 mb-6">Are you sure you want to delete this {confirmDelete.type}?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => {
                  if (confirmDelete.type === "menu") handleDeleteMenuItem(confirmDelete.id);
                  else if (confirmDelete.type === "rider") handleDeleteRider(confirmDelete.id);
                  else if (confirmDelete.type === "feedback") handleDeleteFeedback(confirmDelete.id);
                }}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );

  function renderDashboard() {
    const statCards = [
      { icon: FiShoppingBag, label: "Total Orders", value: stats.totalOrders, color: "from-blue-500 to-blue-600" },
      { icon: FiDollarSign, label: "Total Revenue", value: `Rs. ${stats.totalRevenue.toLocaleString()}`, color: "from-green-500 to-green-600" },
      { icon: FiUsers, label: "Active Customers", value: stats.activeCustomers, color: "from-purple-500 to-purple-600" },
      { icon: FiTruck, label: "Available Riders", value: stats.availableRiders, color: "from-orange-500 to-orange-600" },
    ];

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel flex items-center gap-4"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-sm text-dark-400">{card.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="glass-panel">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-dark-400">
                  <th className="text-left py-3 px-2">Order#</th>
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-left py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-2 text-white">#{order.orderNumber || order.id}</td>
                    <td className="py-3 px-2 text-dark-300">{order.customerName || `Customer #${order.customerId}`}</td>
                    <td className="py-3 px-2 text-white font-medium">{formatPrice(order.totalAmount)}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-dark-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-dark-400">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  }

  function renderMenuManagement() {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">Menu Items</h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button onClick={openCreateMenuForm} className="btn-primary flex items-center gap-2 whitespace-nowrap">
              <FiPlus className="w-4 h-4" /> Add New Item
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm glass-panel">
            <thead>
              <tr className="border-b border-white/10 text-dark-400">
                <th className="text-left py-3 px-3">Name</th>
                <th className="text-left py-3 px-3">Category</th>
                <th className="text-left py-3 px-3">Price</th>
                <th className="text-left py-3 px-3">Tag</th>
                <th className="text-left py-3 px-3">Status</th>
                <th className="text-right py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMenuItems.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-3 text-white">{item.name}</td>
                  <td className="py-3 px-3 text-dark-300">{item.categoryName || "-"}</td>
                  <td className="py-3 px-3 text-white font-medium">{formatPrice(item.price)}</td>
                  <td className="py-3 px-3 text-dark-300">{item.tagName || "-"}</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        item.isAvailable
                          ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                      }`}
                    >
                      {item.isAvailable ? "Available" : "Sold Out"}
                    </button>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditMenuForm(item)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete({ type: "menu", id: item.id })} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMenuItems.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-dark-400">No menu items found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {menuFormOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">{editingMenuItem ? "Edit Menu Item" : "Add New Item"}</h3>
                  <button onClick={() => { setMenuFormOpen(false); setEditingMenuItem(null); setMenuForm({}); }} className="p-2 text-dark-400 hover:text-white">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-dark-400 mb-1">Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={menuForm.name || ""}
                      onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1">Description</label>
                    <textarea
                      className="input-field resize-none"
                      rows={3}
                      value={menuForm.description || ""}
                      onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">Price (Rs.)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        value={menuForm.price || ""}
                        onChange={(e) => setMenuForm({ ...menuForm, price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">Image</label>
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-dark-300 hover:bg-white/10 cursor-pointer transition-all text-sm">
                          {uploadingImage ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                          ) : (
                            <FiUpload className="w-4 h-4 shrink-0" />
                          )}
                          <span className="truncate">{uploadingImage ? "Uploading..." : "Upload"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>
                        <div className="relative flex-[2]">
                          <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                          <input
                            type="text"
                            placeholder="Or paste image URL..."
                            className="input-field w-full pl-10"
                            value={menuForm.image || ""}
                            onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                          />
                        </div>
                      </div>
                      {(menuForm.image) && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-white/10 h-24">
                          <img
                            src={menuForm.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">Category</label>
                      <select
                        className="input-field"
                        value={menuForm.categoryId || ""}
                        onChange={(e) => setMenuForm({ ...menuForm, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">Tag</label>
                      <select
                        className="input-field"
                        value={menuForm.tagId || ""}
                        onChange={(e) => setMenuForm({ ...menuForm, tagId: e.target.value ? Number(e.target.value) : undefined })}
                      >
                        <option value="">Select tag</option>
                        {tags.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 text-sm text-dark-300">
                      <input
                        type="checkbox"
                        checked={menuForm.isAvailable ?? true}
                        onChange={(e) => setMenuForm({ ...menuForm, isAvailable: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
                      />
                      Available
                    </label>
                    <label className="flex items-center gap-2 text-sm text-dark-300">
                      <input
                        type="checkbox"
                        checked={menuForm.isFeatured ?? false}
                        onChange={(e) => setMenuForm({ ...menuForm, isFeatured: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm text-dark-300">
                      <input
                        type="checkbox"
                        checked={menuForm.isExclusive ?? false}
                        onChange={(e) => setMenuForm({ ...menuForm, isExclusive: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
                      />
                      Exclusive
                    </label>
                    <label className="flex items-center gap-2 text-sm text-dark-300">
                      <input
                        type="checkbox"
                        checked={menuForm.isFamilyDeal ?? false}
                        onChange={(e) => setMenuForm({ ...menuForm, isFamilyDeal: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
                      />
                      Family Deal
                    </label>
                    <label className="flex items-center gap-2 text-sm text-dark-300">
                      <input
                        type="checkbox"
                        checked={menuForm.isNewItem ?? false}
                        onChange={(e) => setMenuForm({ ...menuForm, isNewItem: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
                      />
                      New Item
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    onClick={() => { setMenuFormOpen(false); setEditingMenuItem(null); setMenuForm({}); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingMenuItem ? handleUpdateMenuItem : handleCreateMenuItem}
                    className="btn-primary"
                  >
                    {editingMenuItem ? "Update" : "Save"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  function renderOrders() {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h3 className="text-lg font-semibold text-white">All Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm glass-panel">
            <thead>
              <tr className="border-b border-white/10 text-dark-400">
                <th className="text-left py-3 px-3">Order#</th>
                <th className="text-left py-3 px-3">Customer</th>
                <th className="text-left py-3 px-3">Items</th>
                <th className="text-left py-3 px-3">Total</th>
                <th className="text-left py-3 px-3">Status</th>
                <th className="text-right py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-3 text-white">#{order.orderNumber || order.id}</td>
                  <td className="py-3 px-3 text-dark-300">{order.customerName || `Customer #${order.customerId}`}</td>
                  <td className="py-3 px-3 text-dark-300">
                    {typeof order.items === "string"
                      ? order.items
                      : Array.isArray(order.items)
                        ? order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")
                        : "-"}
                  </td>
                  <td className="py-3 px-3 text-white font-medium">{formatPrice(order.totalAmount)}</td>
                  <td className="py-3 px-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border outline-none cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s} className="bg-dark-800 text-white">{getStatusLabel(s)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => { setAssignRiderOrder(order); setSelectedRiderId(order.riderId || null); }}
                        className="px-3 py-1.5 text-xs font-medium border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
                      >
                        {order.riderId ? "Change Rider" : "Assign Rider"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-dark-400">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {assignRiderOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-panel w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Assign Rider</h3>
                  <button onClick={() => setAssignRiderOrder(null)} className="p-2 text-dark-400 hover:text-white">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-dark-400 mb-4">Order #{assignRiderOrder.orderNumber || assignRiderOrder.id}</p>
                <select
                  className="input-field mb-6"
                  value={selectedRiderId || ""}
                  onChange={(e) => setSelectedRiderId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Select a rider</option>
                  {riders.filter((r) => r.isAvailable).map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
                  ))}
                </select>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setAssignRiderOrder(null)} className="btn-secondary">Cancel</button>
                  <button onClick={handleAssignRider} disabled={!selectedRiderId} className="btn-primary">Assign</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  function renderRiders() {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Riders</h3>
          <button
            onClick={() => { setEditingRider(null); setRiderForm({}); setRiderFormOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" /> Add Rider
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm glass-panel">
            <thead>
              <tr className="border-b border-white/10 text-dark-400">
                <th className="text-left py-3 px-3">Name</th>
                <th className="text-left py-3 px-3">Email</th>
                <th className="text-left py-3 px-3">Phone</th>
                <th className="text-left py-3 px-3">Availability</th>
                <th className="text-right py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((rider) => (
                <tr key={rider.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-3 text-white">{rider.name}</td>
                  <td className="py-3 px-3 text-dark-300">{rider.email}</td>
                  <td className="py-3 px-3 text-dark-300">{rider.phone || "-"}</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleRiderAvailability(rider)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        rider.isAvailable
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}
                    >
                      {rider.isAvailable ? "Available" : "Unavailable"}
                    </button>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditRiderForm(rider)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete({ type: "rider", id: rider.id })} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {riders.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-dark-400">No riders found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {riderFormOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-panel w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">{editingRider ? "Edit Rider" : "Add Rider"}</h3>
                  <button onClick={() => { setRiderFormOpen(false); setEditingRider(null); setRiderForm({}); }} className="p-2 text-dark-400 hover:text-white">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-dark-400 mb-1">Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={riderForm.name || ""}
                      onChange={(e) => setRiderForm({ ...riderForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={riderForm.email || ""}
                      onChange={(e) => setRiderForm({ ...riderForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1">Phone</label>
                    <input
                      type="text"
                      className="input-field"
                      value={riderForm.phone || ""}
                      onChange={(e) => setRiderForm({ ...riderForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <button onClick={() => { setRiderFormOpen(false); setEditingRider(null); setRiderForm({}); }} className="btn-secondary">Cancel</button>
                  <button onClick={editingRider ? handleUpdateRider : handleCreateRider} className="btn-primary">
                    {editingRider ? "Update" : "Save"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  function renderCustomers() {
    if (selectedCustomer) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setSelectedCustomer(null)} className="text-dark-400 hover:text-white transition-all">
              <FiX className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-white">{selectedCustomer.name}'s Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm glass-panel">
              <thead>
                <tr className="border-b border-white/10 text-dark-400">
                  <th className="text-left py-3 px-3">Order#</th>
                  <th className="text-left py-3 px-3">Amount</th>
                  <th className="text-left py-3 px-3">Status</th>
                  <th className="text-left py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-3 text-white">#{o.orderNumber || o.id}</td>
                    <td className="py-3 px-3 text-white font-medium">{formatPrice(o.totalAmount)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(o.status)}`}>
                        {getStatusLabel(o.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-dark-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {customerOrders.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-dark-400">No orders found for this customer</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Customers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm glass-panel">
            <thead>
              <tr className="border-b border-white/10 text-dark-400">
                <th className="text-left py-3 px-3">Name</th>
                <th className="text-left py-3 px-3">Email</th>
                <th className="text-left py-3 px-3">Phone</th>
                <th className="text-left py-3 px-3">Orders</th>
                <th className="text-right py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => handleSelectCustomer(c)}>
                  <td className="py-3 px-3 text-white">{c.name}</td>
                  <td className="py-3 px-3 text-dark-300">{c.email}</td>
                  <td className="py-3 px-3 text-dark-300">{c.phone || "-"}</td>
                  <td className="py-3 px-3 text-dark-300">{c.orderCount ?? "-"}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-primary-400 text-xs font-medium">View Orders</span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-dark-400">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  }

  function renderFeedback() {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Customer Feedback</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm glass-panel">
            <thead>
              <tr className="border-b border-white/10 text-dark-400">
                <th className="text-left py-3 px-3">Customer</th>
                <th className="text-left py-3 px-3">Rating</th>
                <th className="text-left py-3 px-3">Comment</th>
                <th className="text-left py-3 px-3">Date</th>
                <th className="text-right py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-3 text-white">{fb.customerName || fb.customerEmail || "Anonymous"}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-0.5">{renderStars(fb.rating)}</div>
                  </td>
                  <td className="py-3 px-3 text-dark-300 max-w-xs truncate">{fb.comment}</td>
                  <td className="py-3 px-3 text-dark-400">{new Date(fb.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-3 text-right">
                    <button onClick={() => setConfirmDelete({ type: "feedback", id: fb.id })} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {feedbacks.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-dark-400">No feedback found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  }

  function renderMessages() {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
        <div className="glass-panel w-full lg:w-80 shrink-0 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Chats</h3>
          <div className="space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selectedChat?.id === chat.id
                    ? "bg-primary-500/20 border border-primary-500/20"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <p className="text-sm font-medium text-white truncate">{chat.subject || chat.customerName || "Chat"}</p>
                <p className="text-xs text-dark-400 truncate mt-1">{chat.customerName || chat.customerEmail || "Unknown"}</p>
                {chat.lastMessage && (
                  <p className="text-xs text-dark-500 truncate mt-1">{chat.lastMessage}</p>
                )}
              </button>
            ))}
            {chats.length === 0 && (
              <p className="text-center text-dark-400 py-8 text-sm">No chats found</p>
            )}
          </div>
        </div>

        <div className="glass-panel flex-1 flex flex-col min-h-0">
          {selectedChat ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div>
                  <h4 className="text-white font-semibold">{selectedChat.subject || "Chat"}</h4>
                  <p className="text-xs text-dark-400">{selectedChat.customerName || selectedChat.customerEmail}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl ${
                      msg.senderRole === "admin"
                        ? "bg-primary-500/20 border border-primary-500/10"
                        : "bg-white/5 border border-white/10"
                    }`}>
                      <p className="text-xs text-dark-400 mb-1">{msg.senderName}</p>
                      <p className="text-sm text-white">{msg.content}</p>
                      <p className="text-xs text-dark-500 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-dark-400 py-8 text-sm">No messages yet</p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  className="input-field flex-1"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendReply(); }}
                />
                <button onClick={handleSendReply} className="btn-primary !px-4 !py-3" disabled={!replyText.trim()}>
                  <FiCheck className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-dark-400">
              <p>Select a chat to view messages</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  function renderSettings() {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
        <div className="glass-panel">
          <h3 className="text-lg font-semibold text-white mb-4">Delivery Charge</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-dark-400 mb-1">Amount (Rs.)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
              />
            </div>
            <button onClick={handleUpdateDeliveryCharge} className="btn-primary">Update</button>
          </div>
        </div>

        <div className="glass-panel">
          <h3 className="text-lg font-semibold text-white mb-4">Update Setting</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-dark-400 mb-1">Setting Key</label>
              <input
                type="text"
                className="input-field"
                value={settingKey}
                onChange={(e) => setSettingKey(e.target.value)}
                placeholder="e.g. min_order_amount"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Setting Value</label>
              <input
                type="text"
                className="input-field"
                value={settingValue}
                onChange={(e) => setSettingValue(e.target.value)}
                placeholder="e.g. 500"
              />
            </div>
            <button onClick={handleUpdateSetting} className="btn-primary" disabled={!settingKey.trim()}>Save Setting</button>
          </div>
        </div>
      </motion.div>
    );
  }
}
