'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
            <Navbar />
            <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-24 sm:py-32">
                <div className="prose dark:prose-invert max-w-none prose-slate prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-primary">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Terms of Service</h1>
                    <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing or using the Excel Community Living Inc website and learning platform ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service.</p>

                    <h2>2. User Accounts</h2>
                    <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</p>
                    <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>

                    <h2>3. Intellectual Property</h2>
                    <p>The Service and its original content (including course materials, videos, text, graphics, and logos), features, and functionality are and will remain the exclusive property of Excel Community Living Inc and its licensors. The Service is protected by copyright, trademark, and other laws.</p>

                    <h2>4. Site Usage and Conduct</h2>
                    <p>You agree not to use the Service:</p>
                    <ul>
                        <li>In any way that violates any applicable national or international law or regulation.</li>
                        <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
                        <li>To impersonate or attempt to impersonate Excel Community Living Inc, a Company employee, another user, or any other person or entity.</li>
                        <li>To distribute, copy, or share course materials outside of the platform without explicit written permission.</li>
                    </ul>

                    <h2>5. Purchases and Payments</h2>
                    <p>If you wish to purchase any product or service made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number and billing address. All payments are securely processed by Stripe.</p>

                    <h2>6. Accounts and Termination</h2>
                    <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                    <h2>7. Limitation of Liability</h2>
                    <p>In no event shall Excel Community Living Inc, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

                    <h2>8. Changes</h2>
                    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>

                    <h2>9. Contact Us</h2>
                    <p>If you have any questions about these Terms, please contact us at support@excelcommunityliving.com.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
