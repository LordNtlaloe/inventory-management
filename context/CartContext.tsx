"use client"
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, CartItem, Branch, Receipt } from '@/lib/types';

interface Cashier {
    id: string;
    name: string;
    email?: string;
}

interface PosContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    increaseQuantity: (productId: string) => void;
    decreaseQuantity: (productId: string) => void;
    applyDiscount: (productId: string, discount: number) => void;
    applyCartDiscount: (amount: number) => void;
    removeCartDiscount: () => void;
    calculateTotals: () => { subtotal: number; totalDiscount: number; total: number };
    clearCart: () => void;
    isPaymentDialogVisible: boolean;
    openPaymentDialog: () => void;
    closePaymentDialog: () => void;
    currentBranch: Branch | null;
    setCurrentBranch: (branch: Branch | null) => void;
    currentCashier: Cashier | null;
    setCurrentCashier: (cashier: Cashier | null) => void;
    currencySymbol: string;
    currentReceipt: Receipt | null;
    setCurrentReceipt: (receipt: Receipt | null) => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

interface PosProviderProps {
    children: ReactNode;
    initialBranch?: Branch | null;
    initialCashier?: Cashier | null;
    initialProducts?: Product[];
}

export function PosProvider({
    children,
    initialBranch = null,
    initialCashier = null,
    initialProducts = []
}: PosProviderProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isPaymentDialogVisible, setIsPaymentDialogVisible] = useState(false);
    const [currentBranch, setCurrentBranch] = useState<Branch | null>(initialBranch);
    const [currentCashier, setCurrentCashier] = useState<Cashier | null>(initialCashier);
    const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);

    const currencySymbol = 'M';

    const addToCart = (product: Product, quantity: number = 1) => {
        if (product.product_quantity <= 0) return;

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product.id === product.id);
            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity > product.product_quantity) {
                    alert(`Only ${product.product_quantity} items available in stock`);
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            }
            return [...prevCart, {
                id: Date.now().toString(),
                product,
                quantity: Math.min(quantity, product.product_quantity),
                discount: 0
            }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item => {
                if (item.product.id === productId) {
                    if (quantity > item.product.product_quantity) {
                        alert(`Only ${item.product.product_quantity} items available in stock`);
                        return item;
                    }
                    return { ...item, quantity };
                }
                return item;
            })
        );
    };

    const applyDiscount = (productId: string, discount: number) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.product.id === productId ? { ...item, discount } : item
            )
        );
    };

    const calculateTotals = () => {
        const subtotal = cart.reduce(
            (sum, item) => sum + (item.product.product_price * item.quantity),
            0
        );
        const totalDiscount = cart.reduce(
            (sum, item) => sum + (item.discount || 0),
            0
        );
        return {
            subtotal,
            totalDiscount,
            total: subtotal - totalDiscount,
        };
    };

    const clearCart = () => setCart([]);
    const openPaymentDialog = () => setIsPaymentDialogVisible(true);
    const closePaymentDialog = () => setIsPaymentDialogVisible(false);

    return (
        <PosContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                increaseQuantity: (productId: string) => {
                    const item = cart.find(item => item.product.id === productId);
                    if (item) updateQuantity(productId, item.quantity + 1);
                },
                decreaseQuantity: (productId: string) => {
                    const item = cart.find(item => item.product.id === productId);
                    if (item) updateQuantity(productId, item.quantity - 1);
                },
                applyDiscount,
                applyCartDiscount: (discount: number) => {
                    setCart(prevCart => prevCart.map(item => ({ ...item, discount })));
                },
                removeCartDiscount: () => {
                    setCart(prevCart => prevCart.map(item => ({ ...item, discount: 0 })));
                },
                calculateTotals,
                clearCart,
                isPaymentDialogVisible,
                openPaymentDialog,
                closePaymentDialog,
                currentBranch,
                setCurrentBranch,
                currentCashier,
                setCurrentCashier,
                currencySymbol,
                currentReceipt,
                setCurrentReceipt
            }}
        >
            {children}
        </PosContext.Provider>
    );
}

export function usePos() {
    const context = useContext(PosContext);
    if (context === undefined) {
        throw new Error('usePos must be used within a PosProvider');
    }
    return context;
}