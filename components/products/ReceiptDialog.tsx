import { usePos } from '@/context/CartContext';
import React, { useCallback, useEffect, useState } from 'react';
import { Printer, Text } from 'react-thermal-printer';
import { Order, PaymentMethod } from '@/lib/types';
import Image from 'next/image';

interface ReceiptProps {
    order: Order
    branchName: string;
    cashierName: string;
    onPrintComplete?: () => void;
}

export const ReceiptDialog = ({ order, branchName, cashierName}: ReceiptProps) => {
    const { cart, calculateTotals } = usePos();
    const { subtotal, totalDiscount, total } = calculateTotals();
    const [paymentMethod] = useState<PaymentMethod>('Cash');
    const [amountReceived, setAmountReceived] = useState(total.toString());
    const [changeAmount, setChangeAmount] = useState('0.00');
    const [paymentReference] = useState('');

    useEffect(() => {
        setAmountReceived(total.toString());
    }, [total]);

    const calculateChange = useCallback(() => {
        const received = parseFloat(amountReceived) || 0;
        const change = received - total;
        setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
    }, [amountReceived, total]);

    useEffect(() => {
        calculateChange();
    }, [amountReceived, total, calculateChange]);

    // If no order data and no cart items, don't render
    if (!order && cart.length === 0) {
        return null;
    }

    return (
        <div className="hidden">
            <Printer width={48} debug={true} type={'epson'}>
                <div className="p-4 bg-white text-black w-[80mm]">
                      <Image 
                            src="/images/TD-Logo.png" 
                            alt="logo" 
                            width={64} 
                            height={64}
                            className="object-contain"
                        />
                    <div className="flex flex-col justify-center items-center gap-2">
                        <Text className="font-semibold">{branchName}</Text>
                        <Text className="text-xs text-center">{branchName}</Text>
                    </div>
                    <div className="flex flex-col gap-3 border-b py-6 text-xs">
                        <p className="flex justify-between">
                            <span className="text-gray-400">Cashier:</span>
                            <span>{cashierName}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-gray-400">Date:</span>
                            <span>
                                {new Date().toLocaleString()}
                            </span>
                        </p>
                        {order && (
                            <p className="flex justify-between">
                                <span className="text-gray-400">Order #:</span>
                                <span>{order.id || 'N/A'}</span>
                            </p>
                        )}
                        <p className="flex justify-between">
                            <span className="text-gray-400">Payment:</span>
                            <span>{paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1).replace('_', ' ')}</span>
                        </p>
                        {paymentMethod === 'Cash' && (
                            <>
                                <p className="flex justify-between">
                                    <span className="text-gray-400">Amount Received:</span>
                                    <span>M{parseFloat(amountReceived).toFixed(2)}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-400">Change:</span>
                                    <span>M{parseFloat(changeAmount).toFixed(2)}</span>
                                </p>
                            </>
                        )}
                        {(paymentMethod === 'Card' || paymentMethod === 'Mobile') && paymentReference && (
                            <p className="flex justify-between">
                                <span className="text-gray-400">Reference:</span>
                                <span>{paymentReference}</span>
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 pb-6 pt-2 text-xs">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="flex">
                                    <th className="w-full py-2">Product</th>
                                    <th className="min-w-[44px] py-2">QTY</th>
                                    <th className="min-w-[44px] py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order
                                    ? order.items?.map((item) => (
                                        <tr key={item.id} className="flex py-1">
                                            <td className="flex-1">{item.product.product_name}</td>
                                            <td className="min-w-[44px]">{item.quantity}</td>
                                            <td className="min-w-[44px]">M{(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))
                                    : cart.map((item) => (
                                        <tr key={item.id} className="flex py-1">
                                            <td className="flex-1">{item.product.product_name}</td>
                                            <td className="min-w-[44px]">{item.quantity}</td>
                                            <td className="min-w-[44px]">M{(item.product.product_price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                        <div className="border-b border border-dashed"></div>
                        <div className="flex flex-col gap-1 pt-4 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>
                                    {order
                                        ? `M${order.subtotal?.toFixed(2) || '0.00'}`
                                        : `M${subtotal.toFixed(2)}`
                                    }
                                </span>
                            </div>
                            {(totalDiscount > 0
                            ) && (
                                    <div className="flex justify-between text-red-500">
                                        <span>Discount:</span>
                                        <span>
                                            -M{totalDiscount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>
                                    {order
                                        ? `M${order.total?.toFixed(2) || '0.00'}`
                                        : `M${total.toFixed(2)}`
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="pt-8 text-center text-xs">
                            <p>Thank you for your purchase!</p>
                            <p className="mt-2">Please come again</p>
                        </div>
                    </div>
                </div>
            </Printer>
        </div>
    );
};