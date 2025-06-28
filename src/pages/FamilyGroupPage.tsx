import React from 'react';
import { FamilyGroupManager } from '../components/family/FamilyGroupManager';

const FamilyGroupPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Family Group</h1>
      <FamilyGroupManager />
    </div>
  );
};

export default FamilyGroupPage;