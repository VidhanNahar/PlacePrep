import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { BrowseExperiences } from './pages/BrowseExperiences';
import { ExperienceDetail } from './pages/ExperienceDetail';
import { SubmitExperience } from './pages/SubmitExperience';
import { CompaniesList } from './pages/CompaniesList';
import { CompanyDetail } from './pages/CompanyDetail';
import { QuestionsHub } from './pages/QuestionsHub';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';

export const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/experiences" element={<BrowseExperiences />} />
          <Route path="/experiences/:id" element={<ExperienceDetail />} />
          <Route path="/submit" element={<SubmitExperience />} />
          <Route path="/companies" element={<CompaniesList />} />
          <Route path="/companies/:slug" element={<CompanyDetail />} />
          <Route path="/questions" element={<QuestionsHub />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
