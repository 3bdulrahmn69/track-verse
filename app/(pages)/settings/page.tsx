'use client';

import { useState } from 'react';
import { PersonalInfoTab } from '@/components/settings/personal-info-tab';
import { SecurityTab } from '@/components/settings/security-tab';
import { Tabs } from '@/components/ui/tabs';
import BackButton from '@/components/shared/back-button';
import { FiUser, FiLock } from 'react-icons/fi';

type Tab = 'personal' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('personal');

  const tabs = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: <FiUser className="w-5 h-5" />,
    },
    {
      id: 'security',
      label: 'Security & Privacy',
      icon: <FiLock className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="px-8 pt-6">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as Tab)}
            />
          </div>

          <div className="p-8">
            {activeTab === 'personal' && <PersonalInfoTab />}
            {activeTab === 'security' && <SecurityTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
