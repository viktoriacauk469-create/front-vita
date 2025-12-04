import React from 'react';
import { Layout } from 'antd';
import AppHeader from './layout/AppHeader';
import AppFooter from './layout/AppFooter';
import AppContent from './layout/AppContent';

export default function Home() {
  return (
    <Layout>
        <AppHeader />
        <AppContent />
        <AppFooter />
      </Layout>
  );
}