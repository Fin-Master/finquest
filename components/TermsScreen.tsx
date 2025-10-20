import React from 'react';
// Fix: Removed unused 'Scale' icon import.
import { ArrowLeft, FileText, Shield, Bot, UserCheck, AlertTriangle, GitBranch } from 'lucide-react';

interface TermsScreenProps {
  onBack: () => void;
}

// Fix: Changed icon type from React.ElementType to a more specific React.ComponentType
// to resolve a TypeScript error where the props of the icon component were inferred as `never`.
const SectionCard: React.FC<{ icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 mb-6 transition-shadow hover:shadow-lg hover:border-gray-600">
    <div className="flex items-center mb-4">
      <Icon className="w-8 h-8 text-indigo-400 mr-4" />
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
    <div className="space-y-3 text-gray-300 leading-relaxed text-base">
      {children}
    </div>
  </div>
);

const TermsScreen: React.FC<TermsScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-purple-900/20 text-gray-300 font-sans p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center mb-8">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition mr-4">
            <ArrowLeft />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          </div>
        </header>

        <main>
          <p className="text-center text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <SectionCard icon={FileText} title="Acceptance of Terms">
            <p>Welcome to <strong>FinQuest AI</strong>! These Terms of Service ("Terms") govern your access to and use of our application and services. By using our app, you agree to be bound by these Terms. This application is a tool for personal financial tracking and analysis; it does not provide professional financial, investment, or legal advice.</p>
          </SectionCard>

          <SectionCard icon={Shield} title="Data Privacy and Security">
            <p>Your privacy is of paramount importance to us. FinQuest AI is designed to be a secure environment for your financial information.</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong className="text-indigo-300">Secure Storage:</strong> Your financial data, goals, and profile information are handled with a commitment to confidentiality and integrity. We implement appropriate security measures to protect your data.</li>
              <li><strong className="text-indigo-300">User-Managed Security:</strong> The optional 4-digit Action PIN provides an additional layer of security for sensitive actions. You are responsible for setting and maintaining the confidentiality of this PIN.</li>
              <li><strong className="text-indigo-300">Data Control:</strong> You have complete control to back up your data or delete it permanently at any time through the in-app Settings. You are solely responsible for managing your backup files.</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Bot} title="AI Assistant and Informational Content">
             <p>FinQuest AI includes "Fin," an AI assistant that analyzes your data to provide insights. You acknowledge the capabilities and limitations of this feature:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong className="text-indigo-300">For Informational Purposes:</strong> Fin's analysis is generated based on the data you provide. Its insights are for informational purposes only, intended to help you identify trends and habits.</li>
              <li><strong className="text-indigo-300">Not Financial Advice:</strong> The AI assistant is not a certified financial advisor. Always consult a qualified professional for personalized financial advice. Any financial decisions made based on AI-generated content are at your sole discretion and risk.</li>
            </ul>
          </SectionCard>

          <SectionCard icon={UserCheck} title="User Conduct and Responsibilities">
            <p>To maintain the integrity of the service, you agree to use FinQuest AI for its intended purpose of personal finance tracking and management. You agree not to misuse the service or attempt to interfere with its proper working, including, but not limited to, reverse-engineering or disrupting the application's components.</p>
          </SectionCard>
          
          <SectionCard icon={AlertTriangle} title="Disclaimers and Limitation of Liability">
             <p>The application is provided on an "as is" and "as available" basis, without any warranties, express or implied.</p>
             <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong className="text-indigo-300">Simulated Environment:</strong> Features such as "Sign in with Google" are simulated for this demonstration environment. No actual connection to external authentication services is made.</li>
                <li><strong className="text-indigo-300">Responsibility for Data:</strong> You are solely responsible for maintaining and protecting your data. We strongly recommend using the backup feature regularly. We are not liable for any loss or corruption of your data.</li>
                <li><strong className="text-indigo-300">Limitation of Liability:</strong> To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your use of the application.</li>
             </ul>
          </SectionCard>

          <SectionCard icon={GitBranch} title="Modification of Terms">
            <p>We reserve the right to modify these Terms at any time. We will provide notice of any material changes. By continuing to use FinQuest AI after such changes become effective, you agree to be bound by the revised Terms.</p>
          </SectionCard>
        </main>
        
        <footer className="text-center text-sm text-gray-500 mt-8">
            <p>Thank you for using FinQuest AI.</p>
        </footer>
      </div>
    </div>
  );
};

export default TermsScreen;
