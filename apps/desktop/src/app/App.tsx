import React, { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { Dashboard } from '../pages/Dashboard'
import { Tables } from '../pages/Tables'
import { MenuItems } from '../pages/MenuItems'
import { MenuCategories } from '../pages/MenuCategories'
import { POS } from '../pages/POS'
import { Invoices } from '../pages/Invoices'
import { Settings } from '../pages/Settings'
import { Finance } from '../pages/Finance'
import { Cashbook } from '../pages/Cashbook'
import { Reports } from '../pages/Reports'
import { Login } from '../pages/Login'
import { Staff } from '../pages/Staff'
import { Attendance } from '../pages/Attendance'
import { Payroll } from '../pages/Payroll'
import { Kitchen } from '../pages/Kitchen'
import { Reservations } from '../pages/Reservations'
import { Toaster } from 'sonner'
import { useThemeStore } from '../store/useThemeStore'

export function App() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  return (
    <HashRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/menu" element={<Navigate to="/menu/items" replace />} />
          <Route path="/menu/items" element={<MenuItems />} />
          <Route path="/menu/categories" element={<MenuCategories />} />
          <Route path="/kitchen" element={<Kitchen />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/cashbook" element={<Cashbook />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
      <Toaster position="top-right" richColors />
    </HashRouter>
  )
}
