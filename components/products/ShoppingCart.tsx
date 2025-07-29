import { Button } from '@/components/ui/button';
import { usePos } from '@/context/CartContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import CartItem from '@/components/products/CartItem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Product, ProductGrade, ProductType } from '@/lib/types';

interface CartItemType {
    id: string;
    product: {
        product_quantity: number;
        product_price: number;
        product_name: string;
        id: string;
        branch?: {
            id: string;
            branch_name: string;
            branch_location: string;
        };
        branch_id?: number;
        category?: string;
        commodity?: string;
        grade?: string;
        // include other product properties you need
    };
    // include other cart item properties you need
    discount?: number;
}


export default function ShoppingCart() {
    const {
        cart,
        openPaymentDialog,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        applyCartDiscount,
        removeCartDiscount,
        calculateTotals,
    } = usePos();

    const { subtotal, totalDiscount, total } = calculateTotals();

    const [discountAmount, setDiscountAmount] = useState('');
    const [discountApplied, setDiscountApplied] = useState(false);

    const handleApplyDiscount = () => {
        const amount = parseFloat(discountAmount);
        if (!isNaN(amount) && amount > 0) {
            // Apply discount but don't let it exceed the subtotal
            const effectiveDiscount = Math.min(amount, subtotal);
            applyCartDiscount(effectiveDiscount);
            setDiscountApplied(true);
            setDiscountAmount('');
        }
    };

    const handleRemoveDiscount = () => {
        removeCartDiscount();
        setDiscountApplied(false);
    };

    // Helper function to create a complete Product object
    const createCompleteProduct = (item: CartItemType): Product => {
        return {
            id: item.product.id,
            product_name: item.product.product_name,
            product_price: item.product.product_price,
            product_quantity: item.product.product_quantity,
            branch_ids: [], // Default empty array or get from item if available
            category: "",
            commodity: "",
            grade: ProductGrade.A,
            created_at: new Date(),
            updated_at: new Date(),
            product_type: ProductType.TIRE // Default or get from item if available
            // Include other required fields from Product type
        };
    };
    return (
        <div className="w-full p-5 bg-white dark:bg-[#1D1D1D] rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Current Order</h2>

            <ScrollArea className="h-[calc(100vh-300px)]">
                {cart.length > 0 ? (
                    cart.map((item) => (
                        <CartItem
                            key={item.id}
                            item={{
                                ...item,
                                discount: item.discount || 0,
                                product: createCompleteProduct(item)
                            }}
                            onIncrease={() => increaseQuantity(item.product.id)}
                            onDecrease={() => decreaseQuantity(item.product.id)}
                            onRemove={() => removeFromCart(item.product.id)}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-4">Your cart is empty</p>
                )}
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span>M{subtotal.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                    <>
                        <div className="flex justify-between text-red-500">
                            <span>Discount:</span>
                            <span>-M{totalDiscount.toFixed(2)}</span>
                        </div>
                        <Button
                            variant="link"
                            className="text-red-500 p-0 h-auto"
                            onClick={handleRemoveDiscount}
                        >
                            Remove Discount
                        </Button>
                    </>
                )}
                <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total:</span>
                    <span>M{total.toFixed(2)}</span>
                </div>
            </div>

            {/* Fixed Amount Discount Input */}
            {!discountApplied && (
                <div className="mt-4 space-y-2">
                    <Label htmlFor="discount">Apply Discount (Fixed Amount)</Label>
                    <div className="flex gap-2">
                        <Input
                            id="discount"
                            type="number"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            placeholder="Enter discount amount"
                            className="flex-1"
                            min="0"
                            step="0.01"
                        />
                        <Button
                            variant="outline"
                            onClick={handleApplyDiscount}
                            disabled={!discountAmount || cart.length === 0 || parseFloat(discountAmount) <= 0}
                        >
                            Apply
                        </Button>
                    </div>
                    {discountAmount && parseFloat(discountAmount) > subtotal && (
                        <p className="text-sm text-red-500">
                            Discount cannot exceed subtotal. Will be capped at M{subtotal.toFixed(2)}
                        </p>
                    )}
                </div>
            )}

            <Button
                className="w-full mt-4"
                onClick={openPaymentDialog}
                disabled={cart.length === 0}
            >
                Process Payment
            </Button>
        </div>
    );
}