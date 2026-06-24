import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PageLayout = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Navbar />
    <main style={{ flex: 1, padding: '120px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>{title}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Last updated: {new Date().toLocaleDateString()}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.6 }}>
        {children}
      </div>
    </main>
    <Footer />
  </div>
);

export const PrivacyPolicyPage = () => (
  <PageLayout title="Privacy Policy">
    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>1. Introduction</h2>
      <p>Welcome to Excel Community Living Inc. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>2. The Data We Collect About You</h2>
      <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
          <li><strong>Financial Data</strong> includes payment card details (processed securely by Stripe; we do not store your full card details).</li>
          <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of courses you have purchased from us.</li>
          <li><strong>Profile Data</strong> includes your purchases or orders made by you, your interests, preferences, and feedback.</li>
          <li><strong>Usage Data</strong> includes information about how you use our website and courses.</li>
      </ul>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>3. How We Use Your Personal Data</h2>
      <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., providing access to courses).</li>
          <li>Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</li>
          <li>Where we need to comply with a legal or regulatory obligation.</li>
      </ul>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>4. Data Security</h2>
      <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>5. Your Legal Rights</h2>
      <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>6. Contact Us</h2>
      <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
      <p style={{ marginTop: '8px' }}>Excel Community Living Inc.<br />Email: support@excelcommunityliving.com</p>
    </section>
  </PageLayout>
);

export const TermsOfServicePage = () => (
  <PageLayout title="Terms of Service">
    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>1. Acceptance of Terms</h2>
      <p>By accessing or using the Excel Community Living Inc website and learning platform ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>2. User Accounts</h2>
      <p style={{ marginBottom: '12px' }}>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</p>
      <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>3. Intellectual Property</h2>
      <p>The Service and its original content (including course materials, videos, text, graphics, and logos), features, and functionality are and will remain the exclusive property of Excel Community Living Inc and its licensors. The Service is protected by copyright, trademark, and other laws.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>4. Site Usage and Conduct</h2>
      <p>You agree not to use the Service:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>In any way that violates any applicable national or international law or regulation.</li>
          <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
          <li>To impersonate or attempt to impersonate Excel Community Living Inc, a Company employee, another user, or any other person or entity.</li>
          <li>To distribute, copy, or share course materials outside of the platform without explicit written permission.</li>
      </ul>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>5. Purchases and Payments</h2>
      <p>If you wish to purchase any product or service made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number and billing address. All payments are securely processed by Stripe.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>6. Accounts and Termination</h2>
      <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>7. Limitation of Liability</h2>
      <p>In no event shall Excel Community Living Inc, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>8. Changes</h2>
      <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>9. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us at support@excelcommunityliving.com.</p>
    </section>
  </PageLayout>
);

export const RefundPolicyPage = () => (
  <PageLayout title="Refund Policy">
    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>1. General Refund Guidelines</h2>
      <p>At Excel Community Living Inc, we are committed to providing high-quality Nursing Assistant Training and educational materials. However, if you are not entirely satisfied with your purchase, we're here to help.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>2. Online Course Refunds</h2>
      <p>For online courses purchased through our platform, you are eligible for a full refund if you meet the following conditions:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>The request is made within <strong>7 days</strong> of the original purchase date.</li>
          <li>You have completed less than <strong>20%</strong> of the course modules and materials.</li>
          <li>You have not downloaded course certificates, PDFs, or exclusive materials.</li>
      </ul>
      <p style={{ marginTop: '12px' }}>If the above conditions are not met, we reserve the right to deny the refund request. We believe this ensures students have a fair chance to evaluate the course while protecting our intellectual property.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>3. How to Request a Refund</h2>
      <p>To request a refund, please send an email to <strong>support@excelcommunityliving.com</strong> with the following details:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Your full name and the email address associated with your account.</li>
          <li>The name of the course you purchased.</li>
          <li>A brief explanation of why you are requesting a refund.</li>
      </ul>
      <p style={{ marginTop: '12px' }}>Our team will review your request and get back to you within 3-5 business days.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>4. Processing Refunds</h2>
      <p>Once your refund request is approved, we will initiate a refund to your original method of payment via Stripe. You will receive the credit automatically depending on your card issuer's policies, which typically takes between 5 to 10 business days.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>5. Exceptional Circumstances</h2>
      <p>In exceptional circumstances, such as severe medical emergencies or technical faults on our platform preventing access to the course, exceptions to this policy may be considered on a case-by-case basis at the sole discretion of the administration.</p>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>6. Contact Us</h2>
      <p>If you have any questions about our Refund Policy, please contact us at support@excelcommunityliving.com.</p>
    </section>
  </PageLayout>
);
