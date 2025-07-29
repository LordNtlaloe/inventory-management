"use client"
import { useState } from 'react';
import POSLayout from '@/layouts/pos/pos-layout';
import { Receipt, type BreadcrumbItem } from '@/lib/types';
import ProductList from '@/components/products/ProductList';
import PaymentDialog from '@/components/products/PaymentDialog';
import { Button } from '@/components/ui/button';
import { MdReceipt } from 'react-icons/md';
import Head from 'next/head';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PosProvider, usePos } from '@/context/CartContext';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'POS',
        href: '/pos',
    },
];

export default function POS() {
    const session = useCurrentUser();
    
    return (
        <PosProvider 
            initialCashier={session ? { 
                id: session.id, 
                name: session.name, 
                email: session.email 
            } : null}
        >
            <POSContent />
        </PosProvider>
    );
}

function POSContent() {
    const session = useCurrentUser();
    const {
        clearCart,
        closePaymentDialog,
        isPaymentDialogVisible,
        currentBranch,
        currentCashier,
        currentReceipt,
        setCurrentReceipt
    } = usePos();

    const [showReceipt, setShowReceipt] = useState(false);

    const branchName = session?.role === 'Manager'
        ? 'All Branches'
        : currentBranch?.branch_name || 'Branch';

    const branchLocation = session?.role === 'Manager'
        ? 'All Branches'
        : currentBranch?.branch_location || 'Branch';

    const handleProcessPaymentSuccess = (receiptData: Receipt) => {
        setCurrentReceipt(receiptData);
        setShowReceipt(true);
        clearCart();
    };

    return (
        <POSLayout breadcrumbs={breadcrumbs}>
            <Head>
                <title>POS System</title>
            </Head>
            <div className="container mx-auto px-5">
                <div className="flex lg:flex-row flex-col-reverse gap-4">
                    <ProductList
                        branchName={branchName}
                        user={session} products={[]}                    />
                </div>
            </div>

            {showReceipt && currentReceipt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Order Receipt</h2>
                            <MdReceipt className="text-2xl" />
                        </div>

                        <div className="space-y-2 mb-4">
                            <p><span className="font-medium">Order #:</span> {currentReceipt.id}</p>
                            <p><span className="font-medium">Date:</span> {new Date(currentReceipt.date).toLocaleString()}</p>
                            <p><span className="font-medium">Cashier:</span> {currentReceipt.cashier}</p>
                            <p><span className="font-medium">Branch:</span> {currentReceipt.branch}</p>
                            <p><span className="font-medium">Payment Method:</span> {currentReceipt.payment_method}</p>
                            {currentReceipt.payment_method === 'cash' && (
                                <>
                                    <p><span className="font-medium">Amount Received:</span> M{currentReceipt.amount_received.toFixed(2)}</p>
                                    <p><span className="font-medium">Change:</span> M{currentReceipt.change_amount.toFixed(2)}</p>
                                </>
                            )}
                        </div>

                        <div className="border-t border-b py-4 my-4">
                            <h3 className="font-medium mb-2">Items:</h3>
                            {currentReceipt.items.map((item, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>{item.product_name} × {item.quantity}</span>
                                        <span>M{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    {item.discount && item.discount > 0 && (
                                        <div className="flex justify-between text-red-500 text-sm ml-4">
                                            <span>Discount</span>
                                            <span>-M{item.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-medium border-b pb-1">
                                        <span>Subtotal</span>
                                        <span>M{item.subtotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Subtotal:</span>
                                <span>M{currentReceipt.items.reduce((sum, item) =>
                                    sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                            </div>

                            {currentReceipt.items.some(item => item.discount && item.discount > 0) && (
                                <div className="flex justify-between text-red-500">
                                    <span className="font-medium">Total Discount:</span>
                                    <span>-M{currentReceipt.items.reduce((sum, item) =>
                                        sum + (item.discount || 0), 0).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>M{currentReceipt.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-6"
                            onClick={() => setShowReceipt(false)}
                        >
                            Close Receipt
                        </Button>
                    </div>
                </div>
            )}

            <PaymentDialog
                open={isPaymentDialogVisible}
                onClose={closePaymentDialog}
                onSuccess={handleProcessPaymentSuccess}
                branchId={currentBranch?.id ?? ''}
                cashierId={currentCashier?.id ?? ''}
                branchName={branchName}
                branchLocation={branchLocation}
                cashierName={currentCashier?.name ?? ''}
            />
        </POSLayout>
    );
}