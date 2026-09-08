// =====================================================
// PRINTMITAR FRONTEND - COMPLETE NEXT.JS APPLICATION
// =====================================================
// This is a simplified single-file version combining all components
// In production, split into separate files as per the project structure

"use client";

import React, { useState, useEffect, useContext, createContext } from "react";

// =====================================================
// TYPES
// =====================================================

interface User {
    id: string;
    email: string;
    name: string;
    role: "STUDENT" | "SHOPKEEPER";
    profilePicture?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, name: string, password: string, role: string) => Promise<void>;
    logout: () => void;
    accessToken: string | null;
}

interface Shop {
    id: string;
    name: string;
    address: string;
    rating: number;
    phone: string;
    isOpen: boolean;
    pricingRules: PricingRule[];
}

interface PricingRule {
    printType: string;
    paperSize: string;
    pricePerPage: number;
    bindingPrice: number;
    laminationPrice: number;
}

interface Order {
    orderId: string;
    orderCode: string;
    status: string;
    shopName: string;
    totalAmount: number;
    otp?: string;
    printSettings: string;
    fileName: string;
    createdAt: string;
}

// =====================================================
// AUTH CONTEXT
// =====================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("accessToken");
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setAccessToken(storedToken);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) throw new Error("Login failed");

            const data = await response.json();
            setUser(data.user);
            setAccessToken(data.accessToken);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("accessToken", data.accessToken);
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const register = async (email: string, name: string, password: string, role: string) => {
        try {
            const response = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, password, role }),
            });

            if (!response.ok) throw new Error("Registration failed");

            const data = await response.json();
            setUser(data.user);
            setAccessToken(data.accessToken);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("accessToken", data.accessToken);
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, accessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};

// =====================================================
// LOGIN PAGE - SHARED COMPONENT
// =====================================================

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login(email, password);
            window.location.href = "/";
        } catch (err) {
            setError("Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">PrintMitar</h1>
                    <p className="text-gray-600 mt-2">Your College Print Buddy</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <a href="/register" className="text-blue-600 hover:underline font-semibold">
                        Register here
                    </a>
                </p>

                {/* Demo Credentials */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Demo Credentials:</p>
                    <p className="text-xs text-gray-600 mb-1">
                        Student: <code>student@test.com</code> / password
                    </p>
                    <p className="text-xs text-gray-600">
                        Shopkeeper: <code>shop@test.com</code> / password
                    </p>
                </div>
            </div>
        </div>
    );
};

// =====================================================
// REGISTER PAGE
// =====================================================

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await register(email, name, password, role);
            window.location.href = "/";
        } catch (err) {
            setError("Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">PrintMitar</h1>
                    <p className="text-gray-600 mt-2">Create Your Account</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Type</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                        >
                            <option value="STUDENT">Student</option>
                            <option value="SHOPKEEPER">Shopkeeper</option>
                        </select>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                    >
                        {isLoading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 hover:underline font-semibold">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
};

// =====================================================
// STUDENT DASHBOARD
// =====================================================

const StudentDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        fetchOrders();
        fetchShops();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/orders/student/my-orders", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const fetchShops = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/shops");
            if (response.ok) {
                const data = await response.json();
                setShops(data);
            }
        } catch (error) {
            console.error("Error fetching shops:", error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-600">PrintMitar</h1>
                    <p className="text-sm text-gray-600 mt-1">Student Portal</p>
                </div>

                <nav className="p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`w-full text-left px-4 py-2 rounded ${
                            activeTab === "dashboard" ? "bg-blue-100 text-blue-600" : "text-gray-700"
                        }`}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab("upload")}
                        className={`w-full text-left px-4 py-2 rounded ${
                            activeTab === "upload" ? "bg-blue-100 text-blue-600" : "text-gray-700"
                        }`}
                    >
                        📤 Upload Document
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`w-full text-left px-4 py-2 rounded ${
                            activeTab === "orders" ? "bg-blue-100 text-blue-600" : "text-gray-700"
                        }`}
                    >
                        📋 My Orders
                    </button>
                    <button
                        onClick={() => setActiveTab("shops")}
                        className={`w-full text-left px-4 py-2 rounded ${
                            activeTab === "shops" ? "bg-blue-100 text-blue-600" : "text-gray-700"
                        }`}
                    >
                        🏪 Print Shops
                    </button>
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-gray-100 p-3 rounded-lg mb-3">
                        <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {activeTab === "dashboard" && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-8">Welcome, {user?.name}!</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="text-4xl font-bold text-blue-600">{orders.length}</div>
                                    <p className="text-gray-600 mt-2">Total Orders</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="text-4xl font-bold text-green-600">
                                        {orders.filter((o) => o.status === "COMPLETED").length}
                                    </div>
                                    <p className="text-gray-600 mt-2">Completed</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="text-4xl font-bold text-yellow-600">
                                        {orders.filter((o) => o.status === "PENDING_OTP").length}
                                    </div>
                                    <p className="text-gray-600 mt-2">Pending</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "upload" && <UploadDocument />}

                    {activeTab === "orders" && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h2>
                            <div className="space-y-4">
                                {orders.length === 0 ? (
                                    <p className="text-gray-600">No orders yet</p>
                                ) : (
                                    orders.map((order) => (
                                        <div key={order.orderId} className="bg-white p-6 rounded-lg shadow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{order.orderCode}</h3>
                                                    <p className="text-sm text-gray-600">Shop: {order.shopName}</p>
                                                    <p className="text-sm text-gray-600">Amount: ₹{order.totalAmount}</p>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                                                        order.status === "COMPLETED"
                                                            ? "bg-green-600"
                                                            : order.status === "PENDING_OTP"
                                                                ? "bg-yellow-600"
                                                                : "bg-blue-600"
                                                    }`}
                                                >
                          {order.status.replace("_", " ")}
                        </span>
                                            </div>
                                            {order.otp && (
                                                <div className="mt-4 p-4 bg-blue-50 rounded border-2 border-blue-600">
                                                    <p className="text-sm text-gray-600 mb-2">Your OTP:</p>
                                                    <p className="text-4xl font-bold text-blue-600 tracking-widest">{order.otp}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "shops" && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Print Shops</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {shops.map((shop) => (
                                    <div key={shop.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                                        <h3 className="text-lg font-bold text-gray-800">{shop.name}</h3>
                                        <p className="text-sm text-gray-600 mt-2">{shop.address}</p>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-yellow-500">★ {shop.rating}</span>
                                            <span className={`text-sm ${shop.isOpen ? "text-green-600" : "text-red-600"}`}>
                        {shop.isOpen ? "Open" : "Closed"}
                      </span>
                                        </div>
                                        <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold">
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// =====================================================
// UPLOAD DOCUMENT COMPONENT
// =====================================================

const UploadDocument: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [shops, setShops] = useState<Shop[]>([]);
    const [selectedShop, setSelectedShop] = useState<string>("");
    const [printSettings, setPrintSettings] = useState({
        color: "BW",
        printSide: "SINGLE",
        paperSize: "A4",
        binding: "NONE",
        copies: 1,
    });
    const [totalAmount, setTotalAmount] = useState(0);
    const [step, setStep] = useState(1);
    const [orderResponse, setOrderResponse] = useState<any>(null);
    const { accessToken } = useAuth();

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/shops");
            if (response.ok) {
                const data = await response.json();
                setShops(data);
                if (data.length > 0) {
                    setSelectedShop(data[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching shops:", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleNext = () => {
        if (step === 1 && selectedFile) {
            setStep(2);
        } else if (step === 2) {
            setTotalAmount(100); // Simplified calculation
            setStep(3);
        }
    };

    const handleSubmitOrder = async () => {
        if (!selectedFile) return;

        try {
            const response = await fetch("http://localhost:8080/api/orders/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    fileObjectKey: selectedFile.name,
                    shopId: selectedShop,
                    printSettings: JSON.stringify(printSettings),
                    paymentMethod: "PAY_AT_SHOP",
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setOrderResponse(data);
                setStep(4);
            }
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Document</h2>

            {step === 1 && (
                <div className="bg-white p-8 rounded-lg shadow max-w-2xl">
                    <h3 className="text-lg font-bold mb-6">Step 1: Upload File</h3>
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            id="file-input"
                        />
                        <label htmlFor="file-input" className="cursor-pointer">
                            <p className="text-gray-600">
                                {selectedFile ? `Selected: ${selectedFile.name}` : "Drag PDF or click to select"}
                            </p>
                            <button
                                type="button"
                                onClick={() => document.getElementById("file-input")?.click()}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Browse Files
                            </button>
                        </label>
                    </div>
                    <button
                        onClick={handleNext}
                        disabled={!selectedFile}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white p-8 rounded-lg shadow max-w-2xl">
                    <h3 className="text-lg font-bold mb-6">Step 2: Configure Settings</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                            <div className="space-x-2">
                                {["BW", "COLOR"].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setPrintSettings({ ...printSettings, color })}
                                        className={`px-4 py-2 rounded ${
                                            printSettings.color === color ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                                        }`}
                                    >
                                        {color === "BW" ? "Black & White" : "Color"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Print Side</label>
                            <div className="space-x-2">
                                {["SINGLE", "DOUBLE"].map((side) => (
                                    <button
                                        key={side}
                                        onClick={() => setPrintSettings({ ...printSettings, printSide: side })}
                                        className={`px-4 py-2 rounded ${
                                            printSettings.printSide === side ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                                        }`}
                                    >
                                        {side === "SINGLE" ? "Single Side" : "Double Side"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Paper Size</label>
                            <select
                                value={printSettings.paperSize}
                                onChange={(e) => setPrintSettings({ ...printSettings, paperSize: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="A4">A4</option>
                                <option value="A3">A3</option>
                                <option value="LEGAL">Legal</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Shop</label>
                            <select
                                value={selectedShop}
                                onChange={(e) => setSelectedShop(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg w-full"
                            >
                                {shops.map((shop) => (
                                    <option key={shop.id} value={shop.id}>
                                        {shop.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Copies</label>
                            <input
                                type="number"
                                min="1"
                                value={printSettings.copies}
                                onChange={(e) => setPrintSettings({ ...printSettings, copies: parseInt(e.target.value) })}
                                className="px-4 py-2 border border-gray-300 rounded-lg w-full"
                            />
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Estimated Total</p>
                        <p className="text-3xl font-bold text-blue-600">₹{totalAmount}</p>
                    </div>

                    <div className="mt-6 flex space-x-4">
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold"
                        >
                            Back
                        </button>
                        <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">
                            Next
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="bg-white p-8 rounded-lg shadow max-w-2xl">
                    <h3 className="text-lg font-bold mb-6">Step 3: Review & Confirm</h3>

                    <div className="space-y-3 mb-6">
                        <p className="text-gray-700">
                            <span className="font-semibold">File:</span> {selectedFile?.name}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Shop:</span> {shops.find((s) => s.id === selectedShop)?.name}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Color:</span> {printSettings.color === "BW" ? "Black & White" : "Color"}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Total Amount:</span> ₹{totalAmount}
                        </p>
                    </div>

                    <div className="mt-6 flex space-x-4">
                        <button
                            onClick={() => setStep(2)}
                            className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmitOrder}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            )}

            {step === 4 && orderResponse && (
                <div className="bg-white p-8 rounded-lg shadow max-w-2xl">
                    <div className="text-center">
                        <h3 className="text-lg font-bold mb-6 text-green-600">✓ Order Placed Successfully!</h3>

                        <p className="text-gray-700 mb-6">Your order code is: <span className="font-bold">{orderResponse.orderCode}</span></p>

                        <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-8 mb-6">
                            <p className="text-sm text-gray-600 mb-2">Your OTP (Show at Shop):</p>
                            <p className="text-5xl font-bold text-blue-600 tracking-widest">{orderResponse.otp}</p>
                            <p className="text-xs text-gray-600 mt-2">This OTP expires in 15 minutes</p>
                        </div>

                        <button
                            onClick={() => window.location.href = "/"}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// =====================================================
// SHOPKEEPER DASHBOARD
// =====================================================

const ShopkeeperDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [orders, setOrders] = useState<Order[]>([]);
    const [otpInput, setOtpInput] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOtpModal, setShowOtpModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/shops/admin/orders", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const handleVerifyOtp = async () => {
        if (!selectedOrder) return;

        try {
            const response = await fetch(`http://localhost:8080/api/orders/${selectedOrder.orderId}/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({ otp: otpInput }),
            });

            if (response.ok) {
                alert("OTP Verified! Order confirmed.");
                setShowOtpModal(false);
                setOtpInput("");
                setSelectedOrder(null);
                fetchOrders();
            } else {
                alert("Invalid OTP");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-600">PrintMitar</h1>
                    <p className="text-sm text-gray-600 mt-1">Shop Admin Portal</p>
                </div>

                <nav className="p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`w-full text-left px-4 py-2 rounded ${
                            activeTab === "dashboard" ? "bg-blue-100 text-blue-600" : "text-gray-700"
                        }`}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`w-full text-left px-4 py-2 rounded ${
                            activeTab === "orders" ? "bg-blue-100 text-blue-600" : "text-gray-700"
                        }`}
                    >
                        📋 Orders Queue
                    </button>
                    <button
                        onClick={() => setActiveTab("pricing")}
                        className={`w-full text-left px-4 py-2 rounded ${
                            activeTab === "pricing" ? "bg-blue-100 text-blue-600" : "text-gray-700"
                        }`}
                    >
                        💰 Pricing
                    </button>
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`w-full text-left px-4 py-2 rounded ${
                            activeTab === "profile" ? "bg-blue-100 text-blue-600" : "text-gray-700"
                        }`}
                    >
                        🏪 Shop Profile
                    </button>
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-gray-100 p-3 rounded-lg mb-3">
                        <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
                        <p className="text-xs text-gray-600">Shopkeeper</p>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {activeTab === "dashboard" && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-8">Welcome, {user?.name}!</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="text-4xl font-bold text-blue-600">{orders.length}</div>
                                    <p className="text-gray-600 mt-2">Total Orders</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="text-4xl font-bold text-yellow-600">
                                        {orders.filter((o) => o.status === "PENDING_OTP").length}
                                    </div>
                                    <p className="text-gray-600 mt-2">Waiting for Verification</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <div className="text-4xl font-bold text-green-600">
                                        {orders.filter((o) => o.status === "COMPLETED").length}
                                    </div>
                                    <p className="text-gray-600 mt-2">Completed Today</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "orders" && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders Queue</h2>
                            <div className="space-y-4">
                                {orders.length === 0 ? (
                                    <p className="text-gray-600">No orders yet</p>
                                ) : (
                                    orders.map((order) => (
                                        <div key={order.orderId} className="bg-white p-6 rounded-lg shadow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{order.orderCode}</h3>
                                                    <p className="text-sm text-gray-600">Student: {order.fileName}</p>
                                                    <p className="text-sm text-gray-600">Amount: ₹{order.totalAmount}</p>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                                                        order.status === "COMPLETED"
                                                            ? "bg-green-600"
                                                            : order.status === "PENDING_OTP"
                                                                ? "bg-yellow-600"
                                                                : "bg-blue-600"
                                                    }`}
                                                >
                          {order.status.replace("_", " ")}
                        </span>
                                            </div>
                                            {order.status === "PENDING_OTP" && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowOtpModal(true);
                                                    }}
                                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                                                >
                                                    Verify OTP
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "pricing" && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Pricing Settings</h2>
                            <div className="bg-white p-8 rounded-lg shadow max-w-2xl">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Page (B&W)</label>
                                        <input type="number" className="px-4 py-2 border border-gray-300 rounded-lg w-full" value="2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Page (Color)</label>
                                        <input type="number" className="px-4 py-2 border border-gray-300 rounded-lg w-full" value="4" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Binding Price</label>
                                        <input type="number" className="px-4 py-2 border border-gray-300 rounded-lg w-full" value="20" />
                                    </div>
                                    <button className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                                        Save Pricing
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop Profile</h2>
                            <div className="bg-white p-8 rounded-lg shadow max-w-2xl">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Name</label>
                                        <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg w-full" value="My Print Shop" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                        <input type="text" className="px-4 py-2 border border-gray-300 rounded-lg w-full" value="College Campus, Block A" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                                        <input type="tel" className="px-4 py-2 border border-gray-300 rounded-lg w-full" value="+91 9876543210" />
                                    </div>
                                    <button className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                                        Update Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* OTP Verification Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
                        <h3 className="text-lg font-bold mb-4">Verify OTP</h3>
                        <p className="text-gray-600 mb-4">Order: {selectedOrder?.orderCode}</p>
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-center text-2xl tracking-widest"
                        />
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowOtpModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVerifyOtp}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// =====================================================
// MAIN APP ROUTER
// =====================================================

const App: React.FC = () => {
    const [route, setRoute] = useState<string>(() => {
        if (typeof window !== "undefined") {
            return window.location.pathname || "/login";
        }
        return "/login";
    });

    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                setRoute("/login");
            } else if (user.role === "STUDENT") {
                setRoute("/student");
            } else if (user.role === "SHOPKEEPER") {
                setRoute("/shopkeeper");
            }
        }
    }, [user, isLoading]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    switch (route) {
        case "/login":
            return <LoginPage />;
        case "/register":
            return <RegisterPage />;
        case "/student":
            return <StudentDashboard />;
        case "/shopkeeper":
            return <ShopkeeperDashboard />;
        default:
            return user?.role === "STUDENT" ? <StudentDashboard /> : <ShopkeeperDashboard />;
    }
};

// =====================================================
// EXPORT - NEXT.JS LAYOUT
// =====================================================

export default function RootLayout() {
    return (
        <html>
        <body>
        <AuthProvider>
            <App />
        </AuthProvider>
        </body>
        </html>
    );
}
