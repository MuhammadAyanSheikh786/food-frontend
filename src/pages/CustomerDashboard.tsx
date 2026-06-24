import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { formatPrice, getStatusColor, getStatusLabel, getImageUrl } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  FiPackage, FiClock, FiStar, FiMessageSquare, FiLogOut,
  FiHome, FiShoppingBag, FiCheckCircle, FiX, FiSend,
  FiUser, FiPhone, FiMapPin, FiCalendar, FiChevronRight, FiTruck,
} from "react-icons/fi";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderNumber?: string;
  customerName?: string;
  customerId?: number;
  items?: OrderItem[] | string;
  totalAmount: number;
  status: string;
  deliveryAddress?: string;
  createdAt: string;
  riderName?: string | null;
  riderPhone?: string | null;
}

interface Feedback {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Chat {
  id: string;
  chatId: string;
  subject: string;
  lastMessage?: string;
  createdAt: string;
}

interface Message {
  id: number;
  content: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
}

const statusSteps = ["pending", "confirmed", "preparing", "ready", "assigned", "picked_up", "delivered"];

const tabs = [
  { key: "active-orders", label: "Active Orders", icon: FiPackage },
  { key: "history", label: "Order History", icon: FiClock },
  { key: "feedback", label: "Feedback", icon: FiStar },
  { key: "support", label: "Support", icon: FiMessageSquare },
];

export function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active-orders");
  const [loading, setLoading] = useState(true);

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [newChatSubject, setNewChatSubject] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role !== "customer") {
      navigate("/");
      return;
    }
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "support") return;
    if (!selectedChat) return;
    const interval = setInterval(() => {
      fetchMessages(selectedChat.chatId);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab, selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchData() {
    setLoading(true);
    try {
      switch (activeTab) {
        case "active-orders":
        case "history":
          await fetchOrders();
          break;
        case "feedback":
          await fetchFeedback();
          break;
        case "support":
          await fetchChats();
          break;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrders() {
    const data = await api.orders.getMyOrders();
    setAllOrders(data as Order[]);
  }

  async function fetchFeedback() {
    try {
      const data = await api.feedback.getAll();
      setFeedbacks(data as Feedback[]);
    } catch {
      setFeedbacks([]);
    }
  }

  async function fetchChats() {
    try {
      const data = await api.messages.getChats();
      setChats(data as Chat[]);
    } catch {
      setChats([]);
    }
  }

  async function fetchMessages(chatId: string) {
    try {
      const data = await api.messages.getMessages(chatId);
      setMessages(data as Message[]);
    } catch {
      setMessages([]);
    }
  }

  async function handleReceive(orderId: number) {
    try {
      await api.orders.receive(orderId);
      toast.success("Order marked as received");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to mark order as received");
    }
  }

  async function handleSubmitFeedback() {
    try {
      await api.feedback.create({ rating: feedbackRating, comment: feedbackComment });
      toast.success("Feedback submitted");
      setFeedbackRating(5);
      setFeedbackComment("");
      fetchFeedback();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback");
    }
  }

  async function handleCreateChat() {
    if (!newChatSubject.trim()) return;
    try {
      const chat = await api.messages.createChat(newChatSubject);
      setChats((prev) => [chat as Chat, ...prev]);
      setSelectedChat(chat as Chat);
      setShowNewChat(false);
      setNewChatSubject("");
      fetchMessages((chat as Chat).chatId);
    } catch (err: any) {
      toast.error(err.message || "Failed to create chat");
    }
  }

  async function handleSendMessage() {
    if (!selectedChat || !messageInput.trim()) return;
    try {
      await api.messages.sendMessage(selectedChat.chatId, messageInput);
      setMessageInput("");
      fetchMessages(selectedChat.chatId);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    }
  }

  async function handleLogout() {
    logout();
    navigate("/login");
  }

  function getActiveOrders(): Order[] {
    return allOrders.filter((o) => o.status !== "received" && o.status !== "cancelled");
  }

  function getHistoryOrders(): Order[] {
    return allOrders.filter((o) => o.status === "delivered" || o.status === "received");
  }

  function parseItems(items: OrderItem[] | string | undefined): OrderItem[] {
    if (!items) return [];
    if (typeof items === "string") return [];
    return items;
  }

  function currentStepIndex(status: string): number {
    return statusSteps.indexOf(status);
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/70 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <FiHome className="w-6 h-6 text-primary-400" />
            <span className="text-lg font-bold gradient-text">Iqbal Food</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-dark-400 hidden sm:inline">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 lg:px-6 pb-3 flex gap-2 overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSelectedChat(null); setMessages([]); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeTab === key
                  ? "bg-gradient-to-r from-primary-500/20 to-primary-600/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/10"
                  : "text-dark-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="pt-36 p-4 lg:p-6 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <motion.div key={activeTab} variants={containerVariants} initial="hidden" animate="visible">
            {activeTab === "active-orders" && renderActiveOrders()}
            {activeTab === "history" && renderHistory()}
            {activeTab === "feedback" && renderFeedback()}
            {activeTab === "support" && renderSupport()}
          </motion.div>
        )}
      </div>
    </div>
  );

  function renderActiveOrders() {
    const activeOrders = getActiveOrders();

    if (activeOrders.length === 0) {
      return (
        <div className="glass-panel flex flex-col items-center justify-center py-16">
          <FiPackage className="w-16 h-16 text-dark-600 mb-4" />
          <p className="text-dark-400 text-lg font-medium">No active orders</p>
          <p className="text-dark-500 text-sm mt-1 mb-6">Browse our menu and place your first order</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <FiHome className="w-4 h-4" />
            Browse Menu
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {activeOrders.map((order, i) => {
          const stepIdx = currentStepIndex(order.status);

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-panel space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    #{order.orderNumber || order.id}
                  </h3>
                  <p className="flex items-center gap-1.5 text-sm text-dark-400 mt-1">
                    <FiCalendar className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border shrink-0 ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="bg-white/5 rounded-xl p-4 space-y-1.5">
                {parseItems(order.items).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-dark-300">{item.name} x{item.quantity}</span>
                    <span className="text-white font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                  <span className="text-dark-400 font-medium">Total</span>
                  <span className="text-white font-bold">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              {order.riderName && (
                <div className="bg-white/5 rounded-xl p-4 space-y-1.5">
                  <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">Delivery Rider</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <FiTruck className="w-4 h-4 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{order.riderName}</p>
                      {order.riderPhone && (
                        <p className="text-xs text-dark-400">{order.riderPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">Order Progress</p>
                <div className="flex items-start gap-1 overflow-x-auto pb-1">
                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx < stepIdx;
                    const isCurrent = idx === stepIdx;
                    const isFuture = idx > stepIdx;

                    return (
                      <div key={step} className="flex items-center min-w-0">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 shrink-0 ${
                              isCompleted
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                : isCurrent
                                  ? "bg-primary-500/20 border-primary-500 text-primary-400 scale-110 shadow-lg shadow-primary-500/20"
                                  : "bg-white/5 border-white/10 text-dark-500"
                            }`}
                          >
                            {isCompleted ? <FiCheckCircle className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-1 whitespace-nowrap px-1 ${
                              isCurrent ? "text-primary-400 font-medium" : isCompleted ? "text-dark-400" : "text-dark-600"
                            }`}
                          >
                            {getStatusLabel(step)}
                          </span>
                        </div>
                        {idx < statusSteps.length - 1 && (
                          <div
                            className={`h-0.5 w-6 sm:w-10 mx-1 mt-[-1rem] rounded-full transition-all duration-500 ${
                              idx < stepIdx ? "bg-emerald-500/50" : "bg-white/10"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.status === "delivered" && (
                <button
                  onClick={() => handleReceive(order.id)}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  Mark as Received
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }

  function renderHistory() {
    const historyOrders = getHistoryOrders();

    if (historyOrders.length === 0) {
      return (
        <div className="glass-panel flex flex-col items-center justify-center py-16">
          <FiClock className="w-16 h-16 text-dark-600 mb-4" />
          <p className="text-dark-400 text-lg font-medium">No order history</p>
          <p className="text-dark-500 text-sm mt-1">Completed orders will appear here</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {historyOrders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel"
          >
            <button
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              className="w-full flex items-center justify-between gap-4 text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-semibold">#{order.orderNumber || order.id}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-dark-400">
                  <span className="flex items-center gap-1.5">
                    <FiCalendar className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-white">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
              <FiChevronRight
                className={`w-5 h-5 text-dark-400 transition-transform duration-300 shrink-0 ${
                  expandedOrder === order.id ? "rotate-90" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                    <div className="bg-white/5 rounded-xl p-4 space-y-1.5">
                      {parseItems(order.items).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-dark-300">{item.name} x{item.quantity}</span>
                          <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    {order.deliveryAddress && (
                      <div className="flex items-start gap-2 text-sm text-dark-300">
                        <FiMapPin className="w-4 h-4 mt-0.5 text-primary-400 shrink-0" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    );
  }

  function renderFeedback() {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Share Your Feedback</h3>

          <div className="mb-6">
            <label className="block text-sm text-dark-400 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className="p-1 transition-all duration-200 hover:scale-110"
                >
                  <FiStar
                    className={`w-8 h-8 transition-all duration-200 ${
                      star <= feedbackRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-dark-500 hover:text-dark-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-dark-400 mb-2">Comment</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder="Tell us about your experience..."
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmitFeedback}
            disabled={!feedbackComment.trim()}
            className="btn-primary flex items-center gap-2"
          >
            <FiSend className="w-4 h-4" />
            Submit Feedback
          </button>
        </motion.div>

        {feedbacks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Your Previous Feedback</h3>
            {feedbacks.map((fb, i) => (
              <motion.div
                key={fb.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel"
              >
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }, (_, idx) => (
                    <FiStar
                      key={idx}
                      className={`w-4 h-4 ${idx < fb.rating ? "text-yellow-400 fill-yellow-400" : "text-dark-500"}`}
                    />
                  ))}
                </div>
                <p className="text-dark-300 text-sm">{fb.comment}</p>
                <p className="text-xs text-dark-500 mt-2">{new Date(fb.createdAt).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  function renderSupport() {
    if (selectedChat) {
      return (
        <motion.div
          key={selectedChat.chatId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel flex flex-col h-[65vh]"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedChat(null); setMessages([]); }}
                className="p-1.5 text-dark-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <FiChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <h3 className="text-white font-semibold">{selectedChat.subject}</h3>
                <p className="text-xs text-dark-400">Support Chat</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderRole === "customer" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.senderRole === "customer"
                      ? "bg-primary-500/20 border border-primary-500/10"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <p className="text-xs text-dark-400 mb-1">{msg.senderName}</p>
                  <p className="text-sm text-white">{msg.content}</p>
                  <p className="text-[10px] text-dark-500 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-center text-dark-400 py-8 text-sm">No messages yet. Start the conversation.</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <input
              type="text"
              placeholder="Type your message..."
              className="input-field flex-1"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="btn-primary !px-4 !py-3"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Support Chats</h3>
          <button
            onClick={() => setShowNewChat(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <FiMessageSquare className="w-4 h-4" />
            Start a Conversation
          </button>
        </div>

        {chats.length === 0 && !showNewChat && (
          <div className="glass-panel flex flex-col items-center justify-center py-16">
            <FiMessageSquare className="w-16 h-16 text-dark-600 mb-4" />
            <p className="text-dark-400 text-lg font-medium">No conversations yet</p>
            <p className="text-dark-500 text-sm mt-1 mb-6">Reach out to our support team</p>
            <button
              onClick={() => setShowNewChat(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FiMessageSquare className="w-4 h-4" />
              Start a Conversation
            </button>
          </div>
        )}

        <AnimatePresence>
          {showNewChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-panel flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-dark-400 mb-1">Subject</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Order Issue, Question..."
                    value={newChatSubject}
                    onChange={(e) => setNewChatSubject(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreateChat(); }}
                  />
                </div>
                <button
                  onClick={handleCreateChat}
                  disabled={!newChatSubject.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiSend className="w-4 h-4" />
                  Start
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {chats.map((chat) => (
            <motion.button
              key={chat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => { setSelectedChat(chat); fetchMessages(chat.chatId); }}
              className="w-full glass-panel flex items-center justify-between gap-4 text-left hover:bg-white/[0.07] transition-all duration-300 cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{chat.subject}</p>
                {chat.lastMessage && (
                  <p className="text-sm text-dark-400 truncate mt-0.5">{chat.lastMessage}</p>
                )}
                <p className="text-xs text-dark-500 mt-1">{new Date(chat.createdAt).toLocaleDateString()}</p>
              </div>
              <FiChevronRight className="w-5 h-5 text-dark-400 shrink-0" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }
}
