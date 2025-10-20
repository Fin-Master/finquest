import React from 'react';
import { ArrowLeft, BookLock, Database, Bot, Share2, UserCog, Shield, Contact, Baby } from 'lucide-react';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

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

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
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
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          </div>
        </header>

        <main>
          <p className="text-center text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <SectionCard icon={BookLock} title="Our Commitment to Your Privacy">
            <p>Welcome to <strong>FinQuest AI</strong>. This Privacy Policy explains how we handle your information when you use our application. We are committed to protecting your privacy and ensuring you have a secure and trustworthy experience.</p>
          </SectionCard>

          <SectionCard icon={Database} title="Information We Handle">
            <p>To provide you with our services, FinQuest AI handles the following types of information:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong className="text-indigo-300">Profile Information:</strong> This includes your name, email address, and profile picture that you provide. This helps personalize your experience.</li>
              <li><strong className="text-indigo-300">Financial Data:</strong> This includes all transactions, savings goals, and any financial details you manually enter into the application. This information is the core of your financial tracking.</li>
              <li><strong className="text-indigo-300">Habit & Activity Data:</strong> We track your daily check-ins to power the gamified streak feature.</li>
            </ul>
          </SectionCard>
          
          <SectionCard icon={UserCog} title="How We Use Your Information">
            <p>We use the information we handle solely to provide and improve the functionality of FinQuest AI. Specifically:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
                <li>To display your financial data, calculate balances, and track your progress towards savings goals.</li>
                <li>To power the gamification features, such as calculating your level and daily streaks.</li>
                <li>To provide your transaction data to the AI assistant ("Fin") for analysis and insight generation, at your request.</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Bot} title="AI Assistant Data Processing">
             <p>To provide financial insights, we use the Google Gemini API. When you request an analysis:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Anonymized transaction data for the selected period is sent to the Gemini API for processing.</li>
              <li>This data is used solely to generate the financial summary and is not linked to your personal identity for any other purpose by the service. We do not send your name, email, or other personal profile information in these requests.</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Share2} title="Information Sharing and Third Parties">
            <p>We do not sell, trade, or otherwise transfer your personally identifiable information or your financial data to outside parties for marketing or advertising purposes. The only third-party service with which data is shared is the Google Gemini API, as described above, for the exclusive purpose of providing AI-powered insights within the app.</p>
          </SectionCard>
          
          <SectionCard icon={Shield} title="Data Security">
            <p>We implement a variety of security measures to maintain the safety of your personal information. All data you provide is stored securely. The optional 4-digit Action PIN adds a layer of client-side security for critical actions, which you control.</p>
          </SectionCard>

          <SectionCard icon={Baby} title="Children's Privacy">
            <p>FinQuest AI is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.</p>
          </SectionCard>

          <SectionCard icon={Contact} title="Changes to This Policy & Contact">
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. If you have any questions regarding this Privacy Policy, you may contact us using the information below: <a href="mailto:privacy@finquestai.mock" className="text-indigo-400 hover:underline">privacy@finquestai.mock</a></p>
          </SectionCard>
        </main>
        
        <footer className="text-center text-sm text-gray-500 mt-8">
            <p>Your trust is the foundation of your financial adventure.</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;