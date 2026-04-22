'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
            <Navbar />
            <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-24 sm:py-32">
                <div className="prose dark:prose-invert max-w-none prose-slate prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-primary">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Refund Policy</h1>
                    <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <h2>1. General Refund Guidelines</h2>
                    <p>At Excel Community Living Inc, we are committed to providing high-quality Nursing Assistant Training and educational materials. However, if you are not entirely satisfied with your purchase, we're here to help.</p>

                    <h2>2. Online Course Refunds</h2>
                    <p>For online courses purchased through our platform, you are eligible for a full refund if you meet the following conditions:</p>
                    <ul>
                        <li>The request is made within <strong>7 days</strong> of the original purchase date.</li>
                        <li>You have completed less than <strong>20%</strong> of the course modules and materials.</li>
                        <li>You have not downloaded course certificates, PDFs, or exclusive materials.</li>
                    </ul>
                    <p>If the above conditions are not met, we reserve the right to deny the refund request. We believe this ensures students have a fair chance to evaluate the course while protecting our intellectual property.</p>

                    <h2>3. How to Request a Refund</h2>
                    <p>To request a refund, please send an email to <strong>support@excelcommunityliving.com</strong> with the following details:</p>
                    <ul>
                        <li>Your full name and the email address associated with your account.</li>
                        <li>The name of the course you purchased.</li>
                        <li>A brief explanation of why you are requesting a refund.</li>
                    </ul>
                    <p>Our team will review your request and get back to you within 3-5 business days.</p>

                    <h2>4. Processing Refunds</h2>
                    <p>Once your refund request is approved, we will initiate a refund to your original method of payment via Stripe. You will receive the credit automatically depending on your card issuer's policies, which typically takes between 5 to 10 business days.</p>

                    <h2>5. Exceptional Circumstances</h2>
                    <p>In exceptional circumstances, such as severe medical emergencies or technical faults on our platform preventing access to the course, exceptions to this policy may be considered on a case-by-case basis at the sole discretion of the administration.</p>

                    <h2>6. Contact Us</h2>
                    <p>If you have any questions about our Refund Policy, please contact us at support@excelcommunityliving.com.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
